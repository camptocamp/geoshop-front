import { IBasemap, IPageFormat } from '@app/models/IConfig';
import { AppState, selectMapState, selectOrder } from '@app/store';
import { updateGeometry } from '@app/store/cart/cart.action';
import * as MapAction from '@app/store/map/map.action';

import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { Feature, Overlay } from 'ol';
import { FeatureLike } from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import ScaleLine from 'ol/control/ScaleLine';
import { Coordinate } from 'ol/coordinate';
import { shiftKeyOnly } from 'ol/events/condition';
import { buffer, getCenter, getArea, Extent } from 'ol/extent';
import FeatureFormat from 'ol/format/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';
import Geometry from 'ol/geom/Geometry';
import MultiPoint from 'ol/geom/MultiPoint';
import Point from 'ol/geom/Point';
import Polygon, { fromExtent } from 'ol/geom/Polygon';
import { defaults as defaultInteractions, DragAndDrop, Draw, Modify } from 'ol/interaction';
import { DragAndDropEvent } from 'ol/interaction/DragAndDrop';
import DragPan from 'ol/interaction/DragPan';
import { createBox } from 'ol/interaction/Draw';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { getArea as getAreaSphere } from 'ol/sphere.js';
import Projection from 'ol/proj/Projection';
import { register } from 'ol/proj/proj4';
import TileSource from 'ol/source/Tile';
import VectorSource from 'ol/source/Vector';
import WMTS, { Options } from 'ol/source/WMTS';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
// @ts-expect-error: plain js import
import Transform from 'ol-ext/interaction/Transform';
import proj4 from 'proj4';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ConfigService } from '@app/services/config.service';
import { formatArea } from '@app/helpers/geoHelper';
import { Order } from '@app/models/IOrder';
import { ApiOrderService } from './api-order.service';
import { OrderValidationStatus } from '@app/models/IApi';
import { MultiPolygon, SimpleGeometry } from 'ol/geom';
import { ISearchResult } from '@app/models/ISearch';

const DEFAULT_RESOLUTIONS = [250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25];

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private initialized = false;
  private geoJsonFormatter = new GeoJSON();
  private snackBarRef: MatSnackBarRef<SimpleSnackBar>;

  private map: Map;
  private basemapLayers: BaseLayer[] = [];
  private projection: Projection;
  private resolutions: number[];
  private initialExtent: number[];
  private areaTooltipElement: HTMLElement;
  private areaTooltip: Overlay;
  private validationStatus: OrderValidationStatus = { valid: true };

  // Drawing
  // private transformInteraction: Transform;
  // private modifyInteraction: Modify;
  private drawInteraction: Draw;

  private isDrawModeActivated = false;
  private drawingSource: VectorSource<Feature<Geometry>>;
  private geocoderSource: VectorSource<Feature<Geometry>>;
  private drawingLayer: VectorLayer<VectorSource<Feature<Geometry>>>;
  private featureFromDrawing: Feature<Geometry> | null;
  public readonly drawingStyle = [
    new Style({
      stroke: new Stroke({
        color: 'rgba(38,165,154,1))',
        width: 3
      }),
      fill: new Fill({
        color: 'rgba(38,165,154,0.1)'
      })
    }),
    new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({
          color: 'rgba(38,165,154,1)'
        }),
      }),
      geometry: (feature) => {
        // return the coordinates of the first ring of the polygon
        const geo = feature.getGeometry();
        if (geo && geo instanceof Polygon) {
          const coordinates = geo.getCoordinates()[0];
          return new MultiPoint(coordinates);
        }

        return geo;
      },
    }),
  ];

  private orderStatus = this.store.pipe(
    select(selectOrder),
    switchMap(order => {
      if (!order.geom || order.items.length <= 0) {
        return of({ valid: true });
      }
      return this.apiOrderService.validateOrder(new Order(order));
    }));

  // Map's interactions
  private dragInteraction: DragPan;

  public isMapLoading$ = new BehaviorSubject<boolean>(true);
  public isDrawing$ = new BehaviorSubject<boolean>(false);

  public get Basemaps() {
    return this.configService.config?.map.basemaps;
  }

  public get PageFormats() {
    return this.configService.config?.pageformats;
  }

  public get FirstBaseMapLayer() {
    return this.basemapLayers.length > 0 ? this.basemapLayers[0] : null;
  }

  constructor(
    private configService: ConfigService,
    private apiOrderService: ApiOrderService,
    private store: Store<AppState>,
    private snackBar: MatSnackBar) {
  }

  private initializeInteractions() {
    const transformInteraction = new Transform({
      rotate: true,
      translate: true,
      scale: false,
      translateFeature: false,
      addCondition: shiftKeyOnly,
      enableRotatedTransform: false,
      hitTolerance: 2,
    });
    transformInteraction.on(['rotateend', 'translateend'], (evt: any) => {
      this.featureFromDrawing = evt.features.item(0);
      this.dispatchCurrentGeometry(true);
    });

    const modifyInteraction = new Modify({
      source: this.drawingSource
    });

    modifyInteraction.on('modifystart', () => {
      transformInteraction.setActive(false);
    });

    modifyInteraction.on('modifyend', (evt) => {
      const firstFeature = new Feature(evt.features.item(0)?.getGeometry())
      this.featureFromDrawing = firstFeature;
      this.dispatchCurrentGeometry(false);
      transformInteraction.setActive(true);
    });

    modifyInteraction.on('change:active', () => {
      const isActive = modifyInteraction.getActive();
      if (isActive) {
        transformInteraction.setActive(false);
      }
    });

    this.map.addInteraction(transformInteraction);
    this.map.addInteraction(modifyInteraction);
  }

  public initialize() {
    if (this.initialized) {
      this.isMapLoading$.next(false);
      this.map.dispose();
      // @ts-ignore
      this.map = null;
    }
    this.initialExtent = this.configService.config!.map.projection.initialExtent;
    this.initializeMap().then(() => {
      this.initializeDrawing();
      this.initializeInteractions();
      this.initializeDragInteraction();
      this.initializeDelKey();
      this.store.select(selectOrder).subscribe(order => {
        if (!this.featureFromDrawing && order && order.geom) {
          const geometry = this.geoJsonFormatter.readGeometry(order.geom);
          const feature = new Feature(geometry);
          this.drawingSource.addFeature(feature);
          this.areaTooltip.setPosition(getCenter(feature.getGeometry()!.getExtent()));
          this.updateAreaTooltip();
        }
      });
      this.initialized = true;
    }).catch(() => {
      this.initialized = true;
    }).then(() => {
      this.store.select(selectMapState).subscribe(params => {
        this.map.getView().fit(params.bounds, { nearest: true });
      });
    });

    this.orderStatus.subscribe((status) => {
      this.validationStatus = status;
      this.updateAreaTooltip();
    });
  }

  public toggleDrawing(drawMode?: string) {
    this.isDrawModeActivated = !this.isDrawModeActivated;
    if (this.isDrawModeActivated) {
      this.createDrawingInteraction(drawMode);
      if (this.featureFromDrawing && this.drawingSource.getFeatures().length > 0) {
        this.drawingSource.removeFeature(this.featureFromDrawing);
        this.featureFromDrawing = null;
      }
      window.oncontextmenu = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        this.drawInteraction.finishDrawing();
        window.oncontextmenu = null;
      };
    } else {
      this.geocoderSource.clear();
      this.map.removeInteraction(this.drawInteraction);
    }
    this.toggleDragInteraction(!this.isDrawModeActivated);
    this.isDrawing$.next(this.isDrawModeActivated);
  }

  public eraseDrawing() {
    if (this.featureFromDrawing) {
      this.drawingSource.removeFeature(this.featureFromDrawing);
      this.featureFromDrawing.dispose();
    }

    if (this.geocoderSource) {
      this.geocoderSource.clear();
    }

    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }

    this.areaTooltipElement.style.visibility = "hidden";
    this.featureFromDrawing = null;
    this.store.dispatch(updateGeometry({ geom: '' }));
  }

  public switchBaseMap(gsId: string) {

    this.map.getLayers().forEach((layerGroup) => {
      if (layerGroup instanceof LayerGroup) {
        layerGroup.getLayers().forEach((layer) => {
          const id = layer.get('gsId');
          if (id && id === gsId) {
            layer.setVisible(true);
          } else {
            layer.setVisible(false);
          }
        });
      } else {
        const id = layerGroup.get('gsId');
        if (!id) {
          return;
        }
        if (id && id === gsId) {
          layerGroup.setVisible(true);
        } else {
          layerGroup.setVisible(false);
        }
      }
    });

  }

  public resizeMap() {
    this.map.updateSize();
  }

  private debounce(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async createTileLayer(baseMapConfig: IBasemap, isVisible: boolean): Promise<TileLayer<TileSource> | undefined> {
    if (!this.resolutions || !this.initialExtent) {
      this.resolutions = this.configService.config?.map.resolutions || DEFAULT_RESOLUTIONS;

      await this.debounce(200);
    }
    const matrixIds = [];
    for (let i = 0; i < this.resolutions.length; i += 1) {
      matrixIds.push(`${16 + i}`); // 16 is the first level of the WMTS
    }

    const tileGrid = new WMTSTileGrid({
      origin: [this.initialExtent[0], this.initialExtent[3]],
      resolutions: this.resolutions,
      matrixIds: matrixIds
    });

    const options = {
      layer: baseMapConfig.id,
      projection: this.projection,
      url: `${this.configService.config?.baseMapUrl}.${baseMapConfig.format}`,
      tileGrid: tileGrid,
      matrixSet: baseMapConfig.matrixSet,
      style: 'default',
      requestEncoding: 'REST'
    }
    if (options == null) {
      return undefined;
    }
    const source = new WMTS(options as Options);
    const tileLayer = new TileLayer({
      source,
      visible: isVisible,
    });
    tileLayer.set('gsId', baseMapConfig.id);
    tileLayer.set('label', baseMapConfig.label);
    tileLayer.set('thumbnail', baseMapConfig.thumbUrl);

    return tileLayer;
  }

  public stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  public createPolygonFromBBOX(bboxString: string): Polygon {
    const coords = bboxString
      .replace('BOX(', '')
      .replace(')', '')
      .split(',')
      .map(coord => coord.trim().split(' ').map(Number));

    const [minX, minY] = coords[0];
    const [maxX, maxY] = coords[1];
    const polygonCoords = [
      [minX, minY],
      [maxX, minY],
      [maxX, maxY],
      [minX, maxY],
      [minX, minY]
    ];

    return new Polygon([polygonCoords]);
  }

  /**
   * Sets two geometries on the map based on the feature returned by de geocoder:
   * - The extent as an order perimeter
   * - The feature itself highlighted
   *
   * If the extent of the feature returned by the geocoder is bigger than 1km², typically a cadastre, commune
   * then the order permimeter will be set to the feature itself and not the extent.
   *
   * @param feature - The feature returned by the geocoder
   */
  public addFeatureFromGeocoderToDrawing(searchResult: ISearchResult) {
    this.geocoderSource.clear();
    if (this.featureFromDrawing) {
      this.drawingSource.removeFeature(this.featureFromDrawing);
    }

    const geometry = searchResult.geometry;
    if (geometry instanceof Point) {
      // TODO if the BBOX is just a point
      const feature = new Feature(searchResult.bbox ? fromExtent(searchResult.bbox) : geometry)
      this.drawingSource.addFeature(feature);
      this.map.getView().fit(feature.getGeometry()!, {
        padding: [75, 75, 75, 75]
      });
    } else {
      const originalExtent = geometry.getExtent();
      if (!originalExtent) {
        return;
      }
      let poly: SimpleGeometry;
      const area = getArea(originalExtent);
      if (geometry instanceof Polygon && area > 1000000) {
        poly = geometry;
      } if (geometry instanceof MultiPolygon) {
        poly = geometry.getPolygon(0);
      } else {
        const bufferValue = area * 0.001;
        poly = fromExtent(buffer(originalExtent, bufferValue));
      }
      this.drawingSource.addFeature(new Feature(poly));
      this.map.getView().fit(poly, {
        padding: [100, 100, 100, 100]
      });
    }
  }


  private async initializeMap() {
    if (!this.configService.config) {
      console.error('There is no config defined in configService, map will not be initialized.');
      return;
    }
    const EPSG = this.configService.config.map.projection.epsg || 'EPSG2056';
    // TODO is this correct or is this cauing the projection shift -> check this
    proj4.defs(EPSG,
      '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333'
      + ' +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel '
      + '+towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs');
    register(proj4);

    this.resolutions = this.configService.config.map.resolutions;
    this.projection = new Projection({
      code: EPSG,
      extent: this.initialExtent,
    });

    const baseLayers = await this.generateBasemapLayersFromConfig();
    const view = new View({
      projection: this.projection,
      center: this.configService.config.map.defaultCenter,
      zoom: 2,
      resolutions: this.resolutions,
      constrainResolution: true,
      extent: this.configService.config.map.constraints
    });

    this.areaTooltipElement = document.createElement('div');
    this.areaTooltipElement.className = 'ol-tooltip-area';
    this.areaTooltip = new Overlay({
      element: this.areaTooltipElement,
      positioning: 'center-center',
      stopEvent: false,
      insertFirst: false,
    });

    // Create the map
    this.map = new Map({
      target: 'map',
      view,
      layers: new LayerGroup({
        layers: baseLayers
      }),
      overlays: [this.areaTooltip],
      interactions: defaultInteractions(
        { doubleClickZoom: false }
      ).extend([this.initializeDragAndDropInteraction()]),
      controls: [
        new ScaleLine({
          target: 'ol-scaleline',
          className: 'my-scale-line',
          units: 'metric',
        })
      ]
    });

    this.map.on('rendercomplete', () => this.map_renderCompleteExecuted);
    this.map.on('change', () => this.isMapLoading$.next(true));
    this.map.on('moveend', () => {
      const bounds = this.map.getView().calculateExtent(this.map.getSize());
      this.store.dispatch(MapAction.saveState({
        state: { bounds: [bounds[0], bounds[1], bounds[2], bounds[3]] },
      }));
    });
  }

  /* Base Map Managment */
  public async generateBasemapLayersFromConfig() {
    let isVisible = true;  // -> display the first one
    let basemaps: IBasemap[] = [];
    if (this.configService.config?.map.basemaps) {
      basemaps = this.configService.config.map.basemaps;
    }
    try {
      for (const baseMapConfig of basemaps) {
        const tileLayer = await this.createTileLayer(baseMapConfig, isVisible);
        if (tileLayer) {
          this.basemapLayers.push(tileLayer);
          isVisible = false;
        }
      }
    } catch (error) {
      console.error(error);
      this.snackBarRef = this.snackBar.open('Impossible de charger les fonds de plans.', 'Ok', {
        duration: 10000,
        panelClass: 'primary-container'
      });
    }

    return this.basemapLayers;
  }

  private addSingleFeatureToDrawingSource(features: FeatureLike[], sourceName: string): boolean {
    if (!sourceName.endsWith('kml') || features.length === 0) {
      // TODO: Translate???
      this.snackBar.open(`Le fichier "${sourceName}" ne contient aucune donnée exploitable.
      Le format supporté est le "kml".`, 'Ok', {
        panelClass: 'notification-info'
      });
      return false;
    }

    if (features.length > 1) {
      // TODO: Translate???
      this.snackBar.open(`Le fichier "${sourceName}" contient plusieurs géométries.
      Un seul polygone sera affiché ici.`, 'Ok', {
        panelClass: 'notification-info'
      });
    }

    for (const featureLike of features) {
      if (featureLike.getGeometry()?.getType() !== 'Polygon') {
        continue;
      }
      const feature = new Feature(featureLike.getGeometry());
      const geom = feature.getGeometry();
      if (geom) {
        this.map.getView().fit(geom.getExtent(), { nearest: true });
      }
      if (this.featureFromDrawing) {
        this.drawingSource.removeFeature(this.featureFromDrawing);
      }
      this.featureFromDrawing = feature;
      this.drawingSource.addFeature(feature);
      return true;
    }

    this.snackBar.open(`Le fichier "${sourceName}" ne contient aucun polygone valide.`, 'Ok', {
      panelClass: 'notification-error'
    });

    return false;
  }

  private initializeDragAndDropInteraction() {
    const dragAndDropInteraction = new DragAndDrop({
      formatConstructors: [
        (KML as unknown) as FeatureFormat
      ]
    });

    dragAndDropInteraction.on('addfeatures', (event: DragAndDropEvent) => {
      let isDataOk = false;
      if (event.features) {
        isDataOk = this.addSingleFeatureToDrawingSource(event.features, event.file.name);
      }
      if (!isDataOk) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    });

    return dragAndDropInteraction;
  }

  private createDrawingInteraction(drawingMode?: string) {
    if (drawingMode === 'Box') {
      this.drawInteraction = new Draw({
        source: this.drawingSource,
        type: 'Circle',
        geometryFunction: createBox()
      });
    } else {
      this.drawInteraction = new Draw({
        source: this.drawingSource,
        type: 'Polygon',
        finishCondition: () => {
          return true;
        }
      });
    }
    this.areaTooltipElement.style.visibility = "hidden";
    this.drawInteraction.on('drawstart', (evt) => {
      this.featureFromDrawing = evt.feature;
    })
    this.drawInteraction.on('drawend', () => {
      this.toggleDrawing();
    });
    this.map.addInteraction(this.drawInteraction);
    this.map.on('pointermove', () => this.updateAreaTooltip());
  }

  private updateAreaTooltip() {
    const feat = this.featureFromDrawing;
    if (!feat || feat.getRevision() <= 0 || feat.getGeometry()?.getType() === 'Point') {
      return
    }
    var content = formatArea(getAreaSphere(feat.getGeometry()!));
    const status = this.validationStatus;
    if (status && status.valid) {
      this.areaTooltipElement.classList.remove('invalid');
    } else if (status.error) {
      this.areaTooltipElement.classList.add('invalid');
      content += `<br/> ${status!.error.message[0]}: (By ${formatArea(status!.error.excluded[0] - status!.error.expected[0])})`;
    }
    this.areaTooltipElement.style.visibility = "visible";
    this.areaTooltip.setPosition(getCenter(feat.getGeometry()!.getExtent()));
    this.areaTooltipElement.innerHTML = content;
  }

  private initializeDrawing() {
    this.drawingSource = new VectorSource({
      useSpatialIndex: false,
    });
    this.geocoderSource = new VectorSource({
      useSpatialIndex: false
    });
    if (this.featureFromDrawing) {
      this.drawingSource.addFeature(this.featureFromDrawing);
    }
    this.drawingSource.on('addfeature', (evt: { feature: any; }) => {
      this.featureFromDrawing = evt.feature;
      this.dispatchCurrentGeometry(true);
    });
    this.drawingLayer = new VectorLayer({
      source: this.drawingSource,
      style: this.drawingStyle
    });

    const geocoderLayer = new VectorLayer({
      source: this.geocoderSource,
      style: [
        new Style({
          stroke: new Stroke({ width: 2, color: 'rgba(255, 235, 59, 1)' }),
          fill: new Fill({ color: 'rgba(255, 235, 59, 0.85)' })
        }),
        new Style({
          image: new CircleStyle({
            radius: 20,
            fill: new Fill({ color: 'rgba(255, 235, 59, 1)' })
          })
        })
      ]
    });
    this.map.addLayer(geocoderLayer);
    this.map.addLayer(this.drawingLayer);


  }

  private dispatchCurrentGeometry(fitMap: boolean) {
    if (this.featureFromDrawing) {
      const polygon = this.featureFromDrawing.getGeometry() as Polygon;
      const area = formatArea(getAreaSphere(polygon));
      this.featureFromDrawing.set('area', area);
      this.store.dispatch(
        updateGeometry(
          {
            geom: this.geoJsonFormatter.writeGeometry(polygon)
          }
        )
      );
      if (fitMap) {
        const extent = this.featureFromDrawing.getGeometry()?.getExtent() || [];
        this.map.getView().fit(extent, {
          padding: [100, 100, 100, 100]
        });
      }
    }
  }

  private displayAreaMessage(area: string) {
    // TODO: Translate???
    this.snackBarRef = this.snackBar.open(`L'aire du polygone sélectionné est de ${area}`, 'Cancel', {
      duration: 5000,
      panelClass: 'primary-container'
    });
  }

  private toggleDragInteraction(isActive: boolean) {
    if (this.dragInteraction) {
      this.dragInteraction.setActive(isActive);
    }
  }

  private initializeDragInteraction() {
    if (!this.dragInteraction) {
      this.map.getInteractions().forEach(interaction => {
        if (interaction instanceof DragPan) {
          this.dragInteraction = interaction;
          return;
        }
      });
    }
  }

  private initializeDelKey() {
    const mapElement = this.map.getTargetElement();
    mapElement.addEventListener('keyup', (e) => {
      if (e.key === 'Delete' && this.drawingSource && this.featureFromDrawing) {
        this.eraseDrawing();
      }
    });
  }

  private map_renderCompleteExecuted() {
    this.isMapLoading$.next(false);
  }

  public loadGeomFromFile(file: File) {
    const kmlFormat = new KML();
    const reader = new FileReader();
    const fileName = file.name;

    reader.onload = () => {
      const fileContent = reader.result;
      if (fileContent) {
        const kmlFeatures = kmlFormat.readFeatures(fileContent, {
          dataProjection: 'EPSG:4326',
          featureProjection: this.configService.config?.map.projection.epsg
        });
        this.addSingleFeatureToDrawingSource(kmlFeatures, fileName);
      }
    };
    reader.readAsText(file);
  }

  public setPageFormat(format: IPageFormat, scale: number, rotation: number) {

    this.eraseDrawing();

    const center = this.map.getView().getCenter();

    const w = format.width * scale / 2000;
    const h = format.height * scale / 2000;
    let coordinates: Array<Array<Coordinate>>;
    if (center && center.length > 0) {
      coordinates = [[
        [center[0] - w, center[1] - h],
        [center[0] - w, center[1] + h],
        [center[0] + w, center[1] + h],
        [center[0] + w, center[1] - h],
        [center[0] - w, center[1] - h],
      ]];
      const poly = new Polygon(coordinates);
      poly.rotate(rotation * Math.PI / 180, center);

      const feature = new Feature();
      feature.setGeometry(poly);

      this.map.getView().fit(poly, { nearest: true });
      this.drawingSource.addFeature(feature);
      this.featureFromDrawing?.set('area', poly);
    }
  }

  public setBBox(extent: Extent) {
    const poly = fromExtent(extent);
    this.eraseDrawing();
    const feature = new Feature();
    feature.setGeometry(poly);
    this.map.getView().fit(poly, { nearest: true });
    this.drawingSource.addFeature(feature);
    this.featureFromDrawing?.set('area', poly);
  }
}
