import { IConfig } from '@app/models/IConfig';
import { ApiOrderService } from '@app/services/api-order.service';
import { ConfigService } from '@app/services/config.service';
import { AppState } from '@app/store';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup, MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@ngrx/store';
import { EMPTY, of } from 'rxjs';
import { vi, expect, it, describe, beforeEach } from 'vitest';

import { NewOrderComponent } from './new-order.component';
import { IOrder, IOrderType, Order } from '@app/models/IOrder';
import { MatOptionModule } from '@angular/material/core';
import { AsyncPipe, CommonModule, CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

const fakeOrder = new Order({
  items: [{
    product: {},
    product_id: 1
  }],
  processing_fee: 1,
  processing_fee_currency: "CHF"
} as unknown as IOrder);

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
  getOrderTypes = () => of([]);
  updateOrder = () => of(null);
}

describe('NewOrderComponent', () => {
  let component: NewOrderComponent;
  let fixture: ComponentFixture<NewOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatAutocompleteModule, MatStepperModule, FormsModule, ReactiveFormsModule, MatSelectModule, MatOptionModule,
        MatError, MatFormFieldModule, MatInputModule, MatRadioButton, MatRadioGroup, AsyncPipe, CurrencyPipe,
        MatProgressSpinnerModule, MatTableModule, MatIconModule, CommonModule, MatButtonModule, MatTableModule,
        ReactiveFormsModule, MatStepperModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatInputModule,
        MatAutocompleteModule, MatIconModule, MatTableModule, MatAutocompleteModule, MatStepperModule, MatProgressSpinnerModule,
        MatDialogModule
      ],
      providers: [
        { provide: ApiOrderService, useClass: MockApiOrderService },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useClass: MockConfig },
        { provide: Store<AppState>, useClass: StoreMock }
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use CHF as currency', () => {
    const typeSelector = component.orderFormGroup.get('orderType');
    if (typeSelector) {
      typeSelector.setValue({} as IOrderType);
    }
    component.currentOrder = fakeOrder;
    component.createOrUpdateDraftOrder(1);
    component.createOrUpdateDraftOrder(2);
    fixture.detectChanges();
    fixture.whenRenderingDone();

    console.log("HERE-CELL: ", fixture.nativeElement.querySelectorAll("li").length);
  });
});
