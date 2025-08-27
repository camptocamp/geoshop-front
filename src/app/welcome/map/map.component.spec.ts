import { ConfigService } from '@app/services/config.service';
import { CustomIconService } from '@app/services/custom-icon.service';
import { AppState } from '@app/store';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { MapComponent } from './map.component';


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

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatProgressSpinnerModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatCardModule,
        NoopAnimationsModule,
        MapComponent,
        RouterModule.forRoot([])
      ],
      providers: [
        CustomIconService,
        ConfigServiceMock,
        { provide: ActivatedRoute, useValue: { queryParamMap: of() } },
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: Store<AppState>, useClass: StoreMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use config to get default extent', () => {
    component.manualEntryParams.extent = [0, 0, 1, 1];
    component.manualEntryParams.constraints = [0, 0, 1, 1];
  })
});
