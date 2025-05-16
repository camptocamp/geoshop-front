

import { ConfigService } from '@app/services/config.service';
import { AppState } from '@app/store';
import { DialogMetadataComponent } from '@app/welcome/catalog/dialog-metadata/dialog-metadata.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AngularSplitModule } from 'angular-split';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { CatalogComponent } from './catalog/catalog.component';
import { DownloadComponent } from './download/download.component';
import { ManualentryComponent } from './map/manualentry/manualentry.component';
import { MapComponent } from './map/map.component';
import { ValidateComponent } from './validate/validate.component';
import { WelcomeComponent } from './welcome.component';



class StoreMock {
  select = vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
  pipe = vi.fn().mockImplementation(() => of(vi.fn()));
}

class ConfigServiceMock {
  public config = {
    initialExtent: [0, 0, 1, 1],
    pageformats: [{ name: "", height: 1, width: 1 }],
  }
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
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { queryParamMap: of() } },
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: Store<AppState>, useClass: StoreMock }
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
