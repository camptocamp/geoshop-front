import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeComponent } from './welcome.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../_store';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AngularSplitModule } from 'angular-split';
import { MapComponent } from './map/map.component';
import { CatalogComponent } from './catalog/catalog.component';
import { DownloadComponent } from './download/download.component';
import { ValidateComponent } from './validate/validate.component';
import { DialogMetadataComponent } from './catalog/dialog-metadata/dialog-metadata.component';
import { ManualentryComponent } from './map/manualentry/manualentry.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
}

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        MatTabsModule,
        MatIconModule,
        MatTooltipModule,
        MatInputModule,
        MatCardModule,
        MatListModule,
        MatProgressSpinnerModule,
        AngularSplitModule,
        MatButtonModule,
        ScrollingModule,
        MatDialogModule,
        MatSnackBarModule,
        MatAutocompleteModule,
        MatExpansionModule,
        MatButtonToggleModule,
        FormsModule,
        DragDropModule,
        MatSelectModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      declarations: [
        WelcomeComponent,
        MapComponent,
        CatalogComponent,
        DownloadComponent,
        ValidateComponent,
        DialogMetadataComponent,
        ManualentryComponent
      ],
      providers: [
        NgControl,
        HttpClient,
        HttpHandler,
        {provide: Store<AppState>, useClass: StoreMock}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
