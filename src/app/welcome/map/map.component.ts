import { SEARCH_CATEGORY, SEARCH_CATEGORY_GENERAL } from '@app/constants';
import { IBasemap, IPageFormat } from '@app/models/IConfig';
import { IManualEntryDialogData } from '@app/models/IManualEntryDialog';
import { ISearchResult } from '@app/models/ISearch';
import { StripHtmlPipe } from '@app/pipes/strip-html.pipe';
import { ConfigService } from '@app/services/config.service';
import { CustomIconService } from '@app/services/custom-icon.service';
import { MapService } from '@app/services/map.service';
import { SearchService } from '@app/services/search.service';
import { AppState, selectMapState } from '@app/store';
import * as MapAction from '@app/store/map/map.action';
import { ManualentryComponent } from '@app/welcome/map/manualentry/manualentry.component';

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
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Extent } from 'ol/extent';
import Geometry from 'ol/geom/Geometry';
import { debounceTime, filter, switchMap } from 'rxjs/operators';



@Component({
  selector: 'gs2-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [
    MatProgressSpinnerModule, MatCardModule, ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatAutocompleteModule, MatIconModule, MatOptgroup,
    MatOptionModule, MatHint, MatButtonModule, MatMiniFabButton, MatMenuModule,
    CommonModule, MatInputModule, MatDialogModule, MatButtonModule, MatOptionModule,
    StripHtmlPipe
  ],
})
export class MapComponent implements OnInit {

  @Input() leftPositionForButtons: number;
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  isDrawing = false;
  isTracking = false;
  isSearchLoading = false;
  shouldDisplayClearButton = false;

  isMapLoading$ = this.mapService.isMapLoading$;
  basemaps: IBasemap[];

  manualEntryParams: IManualEntryDialogData = {
    pageFormats: [],
    selectedPageFormat: {} as IPageFormat,
    selectedPageFormatScale: 500,
    rotationPageFormat: 0,
    pageFormatScales: [500, 1000, 2000, 5000],
    extent: [2500000, 1180000, 2580000, 1240000] as Extent,
    constraints: [2500000, 1180000, 2580000, 1240000] as Extent,
    activeTab: 0
  };

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
    public dialog: MatDialog,
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize custom icons
    this.customIconService.init();
  }

  ngOnInit(): void {
    this.mapService.initialize();
    this.mapService.isDrawing$.subscribe((isDrawing) => this.isDrawing = isDrawing);
    this.basemaps = this.mapService.Basemaps || [];
    this.manualEntryParams.pageFormats = this.mapService.PageFormats || [];
    this.manualEntryParams.selectedPageFormat = this.configService.config?.pageformats[0] as IPageFormat;
    const constraints = this.configService.config?.map.constraints;
    if (constraints) {
      this.manualEntryParams.constraints = constraints;
    }

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
            const categoryId = SEARCH_CATEGORY.get(feature.category) || SEARCH_CATEGORY_GENERAL;
            if (!acc.has(categoryId)) {
              acc.set(categoryId, []);
            }
            acc.get(categoryId)?.push(feature);
            return acc;
          }, new Map<string, ISearchResult[]>);
        });
    }

    const params = new URLSearchParams(window.location.search);
    const routerNavEnd$ = this.router.events.pipe(filter(x => x instanceof NavigationEnd));
    const initialParams = routerNavEnd$.subscribe(() => {
      const bounds = params.get("bounds")?.split(",").map(parseFloat);
      if (!bounds || bounds.length !== 4) {
        initialParams.unsubscribe();
        return;
      }
      this.store.dispatch(MapAction.saveState({
        state: { bounds: [bounds[0], bounds[1], bounds[2], bounds[3]] },
      }));
    });

    this.store.select(selectMapState).subscribe((mapState) => {
      const bounds = mapState.bounds;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { bounds: bounds.join(",") },
        queryParamsHandling: 'merge'
      });
    });
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
      data: this.manualEntryParams
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.manualEntryParams = result;
      if (result.activeTab === 0) {
        if (result.selectedPageFormat) {
          this.mapService.setPageFormat(
            result.selectedPageFormat,
            result.selectedPageFormatScale,
            result.rotationPageFormat
          );
        }
      } else {
        this.mapService.setBBox(result.extent);
      }
    });
  }
}
