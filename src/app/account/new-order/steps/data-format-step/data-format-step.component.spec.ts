import {createOrderItemForm} from "@app/account/new-order/order-form.model";
import * as Constants from "@app/constants";
import {IOrder, IOrderItem, Order} from "@app/models/IOrder";
import {AppState} from "@app/store";
import {CartState} from "@app/store/cart/cart.reducer";

import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ReactiveFormsModule} from "@angular/forms";
import {provideMockStore} from "@ngrx/store/testing";

import { DataFormatStepComponent } from './data-format-step.component';

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

describe('DataFormatStepComponent', () => {
  let component: DataFormatStepComponent;
  let fixture: ComponentFixture<DataFormatStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DataFormatStepComponent,
        ReactiveFormsModule,
      ],
      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataFormatStepComponent);
    component = fixture.componentInstance;
    component.orderItemFormGroup = TestBed.runInInjectionContext(() => createOrderItemForm());
    component.order = new Order({
      items: [] as IOrderItem[]
    } as IOrder);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
