import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Store } from '@ngrx/store';
import { vi } from 'vitest';

import { NewOrderComponent } from './new-order.component';


import { IConfig } from '../../_models/IConfig';
import { ApiOrderService } from '../../_services/api-order.service';
import { AppState } from '../../_store';
import { EMPTY } from 'rxjs';

import { ConfigService } from '../../_services/config.service';

import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

class StoreMock {
  select = vi.fn(() => EMPTY);
  dispatch = vi.fn();
  pipe = vi.fn(() => EMPTY);
}

class MockConfig {
  config = {
    apiUrl: "http://some/api/url"
  } as IConfig;
}

describe('NewOrderComponent', () => {
  let component: NewOrderComponent;
  let fixture: ComponentFixture<NewOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatStepperModule,
        MatFormFieldModule,
        MatSelectModule,
        MatRadioModule,
        MatTableModule,
        ReactiveFormsModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        NoopAnimationsModule,
        NewOrderComponent,
      ],
      providers: [
        ApiOrderService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useClass: MockConfig },
        { provide: Store<AppState>, useClass: StoreMock }
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
