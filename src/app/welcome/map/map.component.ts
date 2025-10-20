import { IBasemap, IPageFormat } from '@app/models/IConfig';
import { IManualEntryDialogData } from '@app/models/IManualEntryDialog';
import { ConfigService } from '@app/services/config.service';
import { CustomIconService } from '@app/services/custom-icon.service';
import { MapService } from '@app/services/map.service';
import { AppState, selectMapState } from '@app/store';
import { ManualentryComponent } from '@app/welcome/map/manualentry/manualentry.component';

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatMiniFabButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Extent } from 'ol/extent';
import { distinctUntilChanged } from 'rxjs/operators';



@Component({
  selector: 'gs2-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [
    MatProgressSpinnerModule, MatCardModule, ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatIconModule, 
    MatOptionModule, MatButtonModule, MatMiniFabButton, MatMenuModule,
    CommonModule, MatInputModule, MatDialogModule, MatButtonModule, MatOptionModule
  ],
})
export class MapComponent implements OnInit {

  @Input() leftPositionForButtons: number;
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  isDrawing = false;
  isTracking = false;

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

  constructor(private mapService: MapService,
    private configService: ConfigService,
    private customIconService: CustomIconService,
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

    this.store.select(selectMapState).pipe(
      distinctUntilChanged((prev, curr) => prev.bounds.every((item, i) => item == curr.bounds[i]))
    ).subscribe((mapState) => {
      const bounds = mapState.bounds.join(",");
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { bounds },
        queryParamsHandling: 'merge'
      });
    });
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
