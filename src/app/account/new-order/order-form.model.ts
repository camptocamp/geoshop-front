import {EMAIL_REGEX, EXTRACT_FORBIDDEN_REGEX, IDE_REGEX, PHONE_REGEX} from "@app/helpers/regex";
import {IOrderType} from "@app/models/IOrder";

import {inject} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators
} from '@angular/forms';

// OrderItemForm
export interface OrderItemForm {
  format: FormArray<FormControl<string|undefined>>;
}

export function createOrderItemForm(): FormGroup<OrderItemForm> {
  const fb = inject(NonNullableFormBuilder);
  return fb.group({
    format: fb.array<FormControl<string|undefined>>([])
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
  const form = fb.group({
    orderType: fb.control({id: 1, name: "private"}, Validators.required),
    title: fb.control("", Validators.compose([
      Validators.pattern(EXTRACT_FORBIDDEN_REGEX), Validators.required
    ])),
    invoice_reference: fb.control(""),
    emailDeliverChoice: fb.control("1"),
    emailDeliver: fb.control("", Validators.pattern(EMAIL_REGEX)),
    description: fb.control(""),
  });
  form.get('orderType')?.valueChanges.subscribe(({id}) => {
    const description = form.get('description');
    if (id === 2) {
      description?.setValidators([Validators.required]);
    } else {
      description?.clearValidators();
    }
    description?.updateValueAndValidity();
  });
  return form;
}

// ContactForm
export interface ContactForm {
  addressChoice: FormControl<string>;
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
  const form = fb.group({
    addressChoice: fb.control("1", Validators.required),
    customer: fb.control(""),
    first_name: fb.control(""),
    last_name: fb.control(""),
    email: fb.control(""),
    company_name: fb.control(""),
    ide_id: fb.control(""),
    phone: fb.control(""),
    street: fb.control(""),
    street2: fb.control(""),
    postcode: fb.control(""),
    city: fb.control(""),
    country: fb.control(""),
    url: fb.control("")
  });

  const updateValidators = (addressChoice: string) => {
    const first_name = form.get('first_name');
    const last_name = form.get('last_name');
    const email = form.get('email');
    const ide_id = form.get('ide_id');
    const phone = form.get('phone');

    if (addressChoice === '2') {
      first_name?.setValidators([Validators.required]);
      last_name?.setValidators([Validators.required]);
      email?.setValidators(Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEX)]));
      ide_id?.setValidators([Validators.pattern(IDE_REGEX)]);
      phone?.setValidators([Validators.pattern(PHONE_REGEX)]);
    } else {
      first_name?.clearValidators();
      last_name?.clearValidators();
      email?.clearValidators();
      ide_id?.clearValidators();
      phone?.clearValidators();
    }

    first_name?.updateValueAndValidity();
    last_name?.updateValueAndValidity();
    email?.updateValueAndValidity();
    ide_id?.updateValueAndValidity();
    phone?.updateValueAndValidity();
  };

  form.get('addressChoice')?.valueChanges.subscribe(value => {
    updateValidators(value);
  });

  // Initial call to set validators based on default value
  updateValidators(form.get('addressChoice')?.value ?? "1");

  return form;
}
