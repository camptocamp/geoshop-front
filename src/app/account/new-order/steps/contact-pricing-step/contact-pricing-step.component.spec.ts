import {ContactForm, OrderForm} from "@app/account/new-order/order-form.model";

import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {FormControl, FormGroup, UntypedFormControl, UntypedFormGroup} from "@angular/forms";

import { ContactPricingStepComponent } from './contact-pricing-step.component';

describe('ContactPricingStepComponent', () => {
  let component: ContactPricingStepComponent;
  let fixture: ComponentFixture<ContactPricingStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPricingStepComponent],
      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactPricingStepComponent);
    component = fixture.componentInstance;
    component.contactFormGroup = new FormGroup<ContactForm>({
      email: new FormControl<string>(''),
      phone: new FormControl<string>(''),
      description: new FormControl<string>(''),
      customer: new FormControl<string>(''),
    });

    component.orderFormGroup = new FormGroup<OrderForm>({
      emailDeliver: new FormControl<string>(''),
      phoneDeliver: new FormControl<string>(''),
      description: new FormControl<string>(''),
    });

    component.addressChoiceForm = new UntypedFormGroup({
      addressChoice: new UntypedFormControl('1')
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
