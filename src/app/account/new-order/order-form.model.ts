import {EMAIL_REGEX, EXTRACT_FORBIDDEN_REGEX, IDE_REGEX, PHONE_REGEX} from "@app/helpers/regex";
import {IOrderType} from "@app/models/IOrder";

import {inject} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators
} from '@angular/forms';

// AddressChoiceForm
export interface AddressChoiceForm {
  addressChoice: FormControl<string>;
}

export function createAddressChoiceForm(): FormGroup<AddressChoiceForm> {
  const fb = inject(NonNullableFormBuilder);
  return fb.group({
    addressChoice: fb.control("1", Validators.required),
  });
}

// OrderItemForm
export interface OrderItemForm {
  formatsForAll: FormControl<string>;
}

export function createOrderItemForm(): FormGroup<OrderItemForm> {
  const fb = inject(NonNullableFormBuilder);
  return fb.group({
    formatsForAll: fb.control("", Validators.required),
  });
}

// OrderForm
export interface OrderForm {
  orderType: FormControl<IOrderType>;
  title: FormControl<string>;
  invoice_reference: FormControl<string>;
  emailDeliverChoice: FormControl<string>;
  emailDeliver: FormControl<string>;
  description: FormControl<string>;
}

export function createOrderForm(): FormGroup<OrderForm> {
  const fb = inject(NonNullableFormBuilder);
  return fb.group({
    orderType: fb.control({id: 1, name: "privat"}, Validators.required),
    title: fb.control("", Validators.compose([Validators.pattern(EXTRACT_FORBIDDEN_REGEX), Validators.min(0)])),
    invoice_reference: fb.control(""),
    emailDeliverChoice: fb.control("1"),
    emailDeliver: fb.control("", Validators.pattern(EMAIL_REGEX)),
    description: fb.control("", Validators.required),
  });
}

// ContactForm
export interface ContactForm {
  customer: FormControl<string>;
  first_name: FormControl<string>;
  last_name: FormControl<string>;
  email: FormControl<string>;
  company_name: FormControl<string>;
  ide_id: FormControl<string>;
  phone: FormControl<string>;
  street: FormControl<string>;
  street2: FormControl<string>;
  postcode: FormControl<string>;
  city: FormControl<string>;
  country: FormControl<string>;
  url: FormControl<string>;
}

export function createContactForm(): FormGroup<ContactForm> {
  const fb = inject(NonNullableFormBuilder);
  return fb.group({
    customer: fb.control(""),
    first_name: fb.control("", Validators.required),
    last_name: fb.control("", Validators.required),
    email: fb.control("", Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEX)])),
    company_name: fb.control(""),
    ide_id: fb.control("", Validators.compose([Validators.pattern(IDE_REGEX)])),
    phone: fb.control("", Validators.pattern(PHONE_REGEX)),
    street: fb.control(""),
    street2: fb.control(""),
    postcode: fb.control(""),
    city: fb.control(""),
    country: fb.control(""),
    url: fb.control("")
  });
}
