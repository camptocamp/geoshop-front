import { defaults } from 'ol/interaction';
import { register } from 'ol/proj/proj4';
import { Order } from '../_models/IOrder';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import { Geometry } from 'ol/geom';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import VectorSource from 'ol/source/Vector';
import { getArea as getAreaSphere } from 'ol/sphere.js';
import { Fill, Style } from 'ol/style';
import proj4 from 'proj4';

import { ConfigService } from '../_services/config.service';
import { MapService } from '../_services/map.service';

const DEFAULT_EXTENT = [2419995.7488073637, 1030006.663199476, 2900009.727428728, 1350004.292478851];


/**
 * Format area output.
 */
export function formatArea(geom: Geometry): string {
  const area = getAreaSphere(geom);
  return area > 100000 ?
    `${Math.round((area / 1000000) * 100) / 100}km<sup>2</sup>` :
    `${Math.round(area * 100) / 100}m<sup>2</sup>`;
}

export async function generateMiniMap(configService: ConfigService, mapService: MapService) {
  mapService.initialize();
  const EPSG = configService.config?.epsg || 'EPSG:2056';
  if (!mapService.FirstBaseMapLayer) {
    proj4.defs(EPSG,
      '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333'
      + ' +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel '
      + '+towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs');
    register(proj4);
  }

  const vectorSource = new VectorSource();
  const layer = new VectorLayer({
    source: vectorSource,
    style: (feature: Feature) => {
      if (feature.get("excluded")) {
        return new Style({
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.5)'
          })
        })
      }
      return mapService.drawingStyle;
    }
  });

  const projection = new Projection({
    code: EPSG,
    extent: configService.config?.initialExtent || DEFAULT_EXTENT,
  });
  const view = new View({
    projection,
    center: fromLonLat([6.80, 47.05], projection),
    zoom: 4,
  });

  const baseMapConfig = configService.config?.basemaps[0];

  let layers;
  if (baseMapConfig) {
    const tileLayer = await mapService.createTileLayer(baseMapConfig, true);
    const groupLayers = tileLayer ? [tileLayer] : []
    layers = new LayerGroup({ layers: groupLayers })
  }
  const minimap = new Map({
    layers,
    view,
    interactions: defaults({
      keyboard: false,
      mouseWheelZoom: false,
      dragPan: false,
      altShiftDragRotate: false,
      shiftDragZoom: false,
      doubleClickZoom: false,
      pinchZoom: false,
    }),
  });

  minimap.addLayer(layer);

  return { minimap, vectorSource };
}

export function displayMiniMap(order: Order, miniMaps: Map[], vectorSources: VectorSource[], index: number) {
  if (!order || !order.geom) {
    return;
  }
  const target = `mini-map-${order.id}`;
  miniMaps[index].setTarget(target);

  const feature = new Feature();
  feature.setGeometry(order.geom);
  vectorSources[index].clear();
  vectorSources[index].addFeature(feature);

  if (order.excludedGeom && order.excludedGeom.getCoordinates().length) {
    const excludedFeature = new Feature();
    excludedFeature.set("excluded", true);
    excludedFeature.setGeometry(order.excludedGeom);
    vectorSources[index].addFeature(excludedFeature);
  }

  miniMaps[index].getView().fit(order.geom, {
    padding: [50, 50, 50, 50]
  });
}
