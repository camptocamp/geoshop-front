import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogComponent } from './catalog.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/_store';
import { of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
}

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        NoopAnimationsModule,
      ],
      declarations: [ CatalogComponent ],
      providers:[
        {provide: Store<AppState>, useClass: StoreMock},
        HttpClient,
        HttpHandler,
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
