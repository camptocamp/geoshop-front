import {Component, Input, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ConfigService} from '../../_services/config.service';
import {MapService} from '../../_services/map.service';
import { CustomIconService } from '../../_services/custom-icon.service';
import {IBasemap, IPageFormat} from '../../_models/IConfig';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {debounceTime, switchMap} from 'rxjs/operators';
import Geometry from 'ol/geom/Geometry';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import Feature from 'ol/Feature';
import {MatDialog} from '@angular/material/dialog';
import {ManualentryComponent} from './manualentry/manualentry.component';

export const nameOfCategoryForGeocoder: { [prop: string]: string; } = { // TODO this should be translated
  zipcode: 'Ortschaftenverzeichnis PLZ',
  gg25: 'Gemeinden',
  district: 'Bezirke',
  kantone: 'Kantone',
  gazetteer: 'OEV Haltestellen',
  address: 'Adressen',
  parcel: 'Parzellen',
};

@Component({
    selector: 'gs2-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    standalone: false
})
export class MapComponent implements OnInit {

  @Input() leftPositionForButtons: number;
  @ViewChild('fileUpload', {static: false}) fileUpload: ElementRef;

  isDrawing = false;
  isTracking = false;
  isSearchLoading = false;
  shouldDisplayClearButton = false;
  basemaps: Array<IBasemap>;
  pageformats: Array<IPageFormat>;
  isMapLoading$ = this.mapService.isMapLoading$;
  selectedPageFormat: IPageFormat | undefined;
  selectedPageFormatScale = 500;
  rotationPageFormat = 0;
  pageFormatScales: Array<number> = [500, 1000, 2000, 5000];
  xMin = null;
  yMin = null;
  xMax = null;
  yMax = null;
  activeTab = 0;

  // Geocoder
  formGeocoder = new UntypedFormGroup({
    search: new UntypedFormControl('')
  });
  geocoderGroupOptions: {
    id: string;
    label: string;
    items: { label: string; feature: Feature<Geometry>; }[]
  }[];

  public get searchCtrl() {
    return this.formGeocoder.get('search');
  }

  constructor(private mapService: MapService,
              private configService: ConfigService,
              private customIconService: CustomIconService,
              public dialog: MatDialog) {
    // Initialize custom icons
    this.customIconService.init();
  }

  ngOnInit(): void {
    this.mapService.initialize();
    this.mapService.isDrawing$.subscribe((isDrawing) => this.isDrawing = isDrawing);
    this.basemaps = this.mapService.Basemaps || [];
    this.pageformats = this.mapService.PageFormats || [];
    this.selectedPageFormat = this.configService.config?.pageformats[0];

    if (this.searchCtrl) {
      this.searchCtrl.valueChanges
        .pipe(
          debounceTime(500),
          switchMap(inputText => {
            this.isSearchLoading = true;
            if (inputText.length === 0) {
              this.shouldDisplayClearButton = false;
            }
            return this.mapService.geocoderSearch(inputText);
          })
        )
        .subscribe(features => {
          this.isSearchLoading = false;
          this.shouldDisplayClearButton = true;
          this.geocoderGroupOptions = [];

          for (const feature of features) {
            const categoryId = feature.get('origin') || feature.get('origin') !== '' ? feature.get('origin') : 'Allgemein'; // TODO add to translation Allgemein

            let currentCategory = this.geocoderGroupOptions.find(x => x.id === categoryId);
            if (currentCategory) {
              currentCategory.items.push({
                label: this.mapService.stripHtmlTags(feature.get('label')),
                feature
              });
            } else {
              currentCategory = {
                id: categoryId,
                label: nameOfCategoryForGeocoder[categoryId],
                items: [{
                  label: this.mapService.stripHtmlTags(feature.get('label')),
                  feature
                }]
              };
              this.geocoderGroupOptions.push(currentCategory);
            }
          }
        });
    }
  }

  displayGeocoderResultWith(value: { label: string; geometry: Geometry }) {
    return value.label;
  }

  displayGeocoderResultOnTheMap(evt: MatAutocompleteSelectedEvent) {
    this.mapService.addFeatureFromGeocoderToDrawing(evt.option.value.feature);
    this.shouldDisplayClearButton = true;
  }

  toggleDrawing(drawingMode?: string) {
    this.mapService.toggleDrawing(drawingMode);
  }

  eraseDrawing() {
    this.mapService.eraseDrawing();
  }

  switchBasemap(gsId: string) {
    this.mapService.switchBaseMap(gsId);
  }

  openFileImport() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      this.mapService.loadGeomFromFile(fileUpload.files[0]);
    };
    fileUpload.click();
  }

  toggleManualentry(): void {
    const dialogRef = this.dialog.open(ManualentryComponent, {
      minWidth: 250,
      autoFocus: true,
      data: {
        pageFormatScales: this.pageFormatScales,
        pageFormats: this.pageformats,
        selectedPageFormat: this.selectedPageFormat,
        selectedPageFormatScale: this.selectedPageFormatScale,
        rotationPageFormat: this.rotationPageFormat,
        activeTab: this.activeTab
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.activeTab === 0) {
          this.selectedPageFormat = result.selectedPageFormat;
          this.selectedPageFormatScale = result.selectedPageFormatScale;
          this.rotationPageFormat = result.rotationPageFormat;
          if (this.selectedPageFormat) {
            this.mapService.setPageFormat(
              this.selectedPageFormat,
              this.selectedPageFormatScale,
              this.rotationPageFormat
            );
          }
        } else {
          this.activeTab = 0;
          this.mapService.setBbox(
            result.xMin,
            result.yMin,
            result.xMax,
            result.yMax,
          );
        }
      }
    });
  }

}
