import {createOrderForm} from "@app/account/new-order/order-form.model";

import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ReactiveFormsModule } from "@angular/forms";

import { OrderTypeStepComponent } from './order-type-step.component';

describe('OrderTypeStepComponent', () => {
  let component: OrderTypeStepComponent;
  let fixture: ComponentFixture<OrderTypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrderTypeStepComponent,
        ReactiveFormsModule,
      ],
      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTypeStepComponent);
    component = fixture.componentInstance;
    component.orderFormGroup = TestBed.runInInjectionContext(() => createOrderForm());
    component.orderTypes = [{id: 1, name: 'private'},  {id: 2, name: 'public'}];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
