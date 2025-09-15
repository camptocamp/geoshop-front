import * as Constants from '@app/constants';
import { IConfig } from '@app/models/IConfig';
import { IOrder, Order } from '@app/models/IOrder';
import { ApiOrderService } from '@app/services/api-order.service';
import { ConfigService } from '@app/services/config.service';
import { AppState } from '@app/store';
import { CartState } from '@app/store/cart/cart.reducer';

import { AsyncPipe, CommonModule, CurrencyPipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DEFAULT_CURRENCY_CODE } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { expect, it, describe, beforeEach } from 'vitest';

import { NewOrderComponent } from './new-order.component';

class MockConfig {
  config = {
    apiUrl: "http://some/api/url"
  } as IConfig;
}

class MockApiOrderService {
  getOrderTypes = () => of([{ id: 1, name: Constants.ORDERTYPE_PRIVATE }]);
  updateOrder = () => of(null);
  getFullOrder = (x: IOrder) => of(new Order(x));
}

const initialState = {
  auth: {},
  map: {},
  cart: {
    total: 1,
    items: [{
      price_status: "CALCULATED",
      price: 100,
      product: {},
      product_id: 1
    }],
    title: "Fake order",
    invoice_reference: '',
    email_deliver: '',
    description: '',
    order_type: Constants.ORDERTYPE_PRIVATE,
    processing_fee: 1,
  } as unknown as CartState
} as AppState;

describe('NewOrderComponent', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AsyncPipe, CommonModule, CurrencyPipe, FormsModule, MatAutocompleteModule, MatButtonModule,
        MatDialogModule, MatError, MatFormFieldModule, MatIconModule, MatInputModule,
        MatOptionModule, MatProgressSpinnerModule, MatRadioButton, MatRadioGroup, MatSelectModule,
        MatStepperModule, MatTableModule, NoopAnimationsModule, ReactiveFormsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({ initialState }),
        { provide: DEFAULT_CURRENCY_CODE, useValue: 'CHF' },
        { provide: ConfigService, useClass: MockConfig },
        { provide: ApiOrderService, useClass: MockApiOrderService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    expect(TestBed.createComponent(NewOrderComponent).componentInstance).toBeTruthy();
  });

  it('should use CHF as default currency', () => {
    const fixture = TestBed.createComponent(NewOrderComponent);
    fixture.detectChanges();
    fixture.componentInstance.createOrUpdateDraftOrder(2);
    fixture.detectChanges();
    fixture.whenRenderingDone();

    expect(fixture.nativeElement.querySelector(".sitn-td-price span").innerHTML).toEqual("CHF100.00");
  });

  it('should use CHF as default currency', () => {
    const fixture = TestBed.createComponent(NewOrderComponent);
    fixture.detectChanges();
    fixture.componentInstance.createOrUpdateDraftOrder(2);
    fixture.detectChanges();
    fixture.whenRenderingDone();

    expect(fixture.nativeElement.querySelector(".sitn-td-price span").innerHTML).toEqual("CHF100.00");
  });
});
