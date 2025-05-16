import { IConfig } from '@app/models/IConfig';
import { ApiOrderService } from '@app/services/api-order.service';
import { ConfigService } from '@app/services/config.service';
import { AppState } from '@app/store';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@ngrx/store';
import { EMPTY, of } from 'rxjs';
import { vi } from 'vitest';

import { NewOrderComponent } from './new-order.component';

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

class MockApiOrderService {
  getOrderTypes() {
    return of([]);
  }
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
        { provide: ApiOrderService,useClass: MockApiOrderService },
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
