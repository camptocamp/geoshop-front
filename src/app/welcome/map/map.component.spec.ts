import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapComponent } from './map.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/_store';
import { of } from 'rxjs';
import { CustomIconService } from 'src/app/_services/custom-icon.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
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
        RouterModule.forRoot([])
      ],
      declarations: [ MapComponent ],
      providers:[
        CustomIconService,
        {provide: Store<AppState>, useClass: StoreMock},
        HttpClient,
        HttpHandler,
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
});
