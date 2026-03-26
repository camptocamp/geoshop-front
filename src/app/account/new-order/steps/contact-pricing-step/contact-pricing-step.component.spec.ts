import { createContactForm, createOrderForm } from "@app/account/new-order/order-form.model";

import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup} from "@angular/forms";

import { ContactPricingStepComponent } from './contact-pricing-step.component';

describe('ContactPricingStepComponent', () => {
  let component: ContactPricingStepComponent;
  let fixture: ComponentFixture<ContactPricingStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContactPricingStepComponent,
        ReactiveFormsModule,
      ],
      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactPricingStepComponent);
    component = fixture.componentInstance;
    component.contactFormGroup = TestBed.runInInjectionContext(() =>createContactForm());
    component.orderFormGroup = TestBed.runInInjectionContext(() => createOrderForm());
    component.addressChoiceForm = new UntypedFormGroup({
      addressChoice: new UntypedFormControl('1')
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
