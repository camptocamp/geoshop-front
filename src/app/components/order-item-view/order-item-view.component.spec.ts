import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { expect, it, describe, beforeEach } from 'vitest';
import * as Constants from '@app/constants';
import { OrderItemViewComponent } from './order-item-view.component';
import { DEFAULT_CURRENCY_CODE } from '@angular/core';
import { IOrder, Order } from '@app/models/IOrder';

const fakeOrder = new Order({
  total: 1,
  items: [{
    price_status: "CALCULATED",
    price: "100",
    product: {id: 1, label: "Fake product 1"},
    product_id: 1
  }],
  title: "Fake order",
  invoice_reference: '',
  email_deliver: '',
  description: '',
  order_type: Constants.ORDERTYPE_PRIVATE,
  processing_fee: "1",
} as unknown as IOrder);

describe('OrderItemViewComponent', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrderItemViewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DEFAULT_CURRENCY_CODE, useValue: 'CHF' },
      ]
    })
      .compileComponents();
  });

  it('should create', () => {
    expect(TestBed.createComponent(OrderItemViewComponent).componentInstance).toBeTruthy();
  });

  it('should use CHF as default currency', () => {
    const fixture = TestBed.createComponent(OrderItemViewComponent);
    fixture.componentInstance.order = fakeOrder;
    fixture.componentInstance.dataSource = fakeOrder.items;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".sitn-td-price span").innerHTML).toEqual("CHF100.00");
  });
});
