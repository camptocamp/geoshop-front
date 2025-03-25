import { vi } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewOrderComponent } from './new-order.component';

import { Store } from '@ngrx/store';
import { AppState } from '../../_store';
import { EMPTY } from 'rxjs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { ApiOrderService } from '../../_services/api-order.service';
import { ConfigService } from '../../_services/config.service';
import { IConfig } from '../../_models/IConfig';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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
      ],
      declarations: [NewOrderComponent],
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
