import { IBasemap, IPageFormat } from '@app/models/IConfig';
import { ConfigService } from '@app/services/config.service';
import { CustomIconService } from '@app/services/custom-icon.service';
import { MapService } from '@app/services/map.service';
import { SearchService } from '@app/services/search.service';

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatOptgroup } from '@angular/material/autocomplete';
import { MatButtonModule, MatMiniFabButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatHint, MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Geometry from 'ol/geom/Geometry';
import { debounceTime, switchMap } from 'rxjs/operators';

import { ManualentryComponent } from './manualentry/manualentry.component';
import { ISearchResult } from '@app/models/ISearch';
import { SEARCH_CATEGORY, SEARCH_CATEGORY_GENERAL } from '@app/constants';

@Component({
  selector: 'gs2-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [
    MatProgressSpinnerModule, MatCardModule, ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatAutocompleteModule, MatIconModule, MatOptgroup,
    MatOptionModule, MatHint, MatButtonModule, MatMiniFabButton, MatMenuModule,
    CommonModule, MatInputModule, MatDialogModule, MatButtonModule, MatOptionModule,
  ],
})
export class MapComponent implements OnInit {

  @Input() leftPositionForButtons: number;
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  isDrawing = false;
  isTracking = false;
  isSearchLoading = false;
  shouldDisplayClearButton = false;
  basemaps: IBasemap[];
  pageformats: IPageFormat[];
  isMapLoading$ = this.mapService.isMapLoading$;
  selectedPageFormat: IPageFormat | undefined;
  selectedPageFormatScale = 500;
  rotationPageFormat = 0;
  pageFormatScales: number[] = [500, 1000, 2000, 5000];
  xMin = null;
  yMin = null;
  xMax = null;
  yMax = null;
  activeTab = 0;

  // Geocoder
  formGeocoder = new UntypedFormGroup({
    search: new UntypedFormControl('')
  });
  featureByCategory: Map<string, ISearchResult[]> = new Map<string, ISearchResult[]>();

  public get searchCtrl() {
    return this.formGeocoder.get('search');
  }

  constructor(private mapService: MapService,
    private configService: ConfigService,
    private customIconService: CustomIconService,
    private readonly searchService: SearchService,
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
            return this.searchService.search(inputText);
          })
        )
        .subscribe(features => {
          this.isSearchLoading = false;
          this.shouldDisplayClearButton = true;
          this.featureByCategory = features.reduce((acc, feature) => {
            console.log(feature.category);
            const categoryId = SEARCH_CATEGORY.get(feature.category) || SEARCH_CATEGORY_GENERAL;
            if (!acc.has(categoryId)) {
              acc.set(categoryId, []);
            }
            acc.get(categoryId)!.push(feature);
            return acc;
          }, new Map<string, ISearchResult[]>);
        });
    }
  }

  displayGeocoderResultWith(value: { label: string; geometry: Geometry }) {
    return value.label;
  }

  displayGeocoderResultOnTheMap(evt: MatAutocompleteSelectedEvent) {
    this.mapService.addFeatureFromGeocoderToDrawing(evt.option.value);
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
