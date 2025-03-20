import { vi } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../_store';

import { of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

class StoreMock {
  select =  vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatStepperModule,
        MatSelectModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      declarations: [ RegisterComponent ],
      providers:[
        {provide: Store<AppState>, useClass: StoreMock},
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
