import {OrderForm} from "@app/account/new-order/order-form.model";
import {EMAIL_REGEX, EXTRACT_FORBIDDEN_REGEX} from "@app/helpers/regex";

import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormGroup, UntypedFormControl, Validators} from "@angular/forms";

import { OrderTypeStepComponent } from './order-type-step.component';

describe('OrderTypeStepComponent', () => {
  let component: OrderTypeStepComponent;
  let fixture: ComponentFixture<OrderTypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTypeStepComponent],
      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTypeStepComponent);
    component = fixture.componentInstance;
    component.orderFormGroup = new FormGroup<OrderForm>({
      orderType: new UntypedFormControl(this, Validators.required),
      title: new UntypedFormControl('', Validators.compose(
        [Validators.pattern(EXTRACT_FORBIDDEN_REGEX), Validators.required])),
      invoice_reference: new UntypedFormControl(''),
      emailDeliverChoice: new UntypedFormControl('1'),
      emailDeliver: new UntypedFormControl('', Validators.pattern(EMAIL_REGEX)),
      description: new UntypedFormControl('', Validators.required),
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
