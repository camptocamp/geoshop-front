import {FormGroup, FormControl, Validators} from '@angular/forms';
import { PHONE_REGEX, IDE_REGEX, EMAIL_REGEX, EXTRACT_FORBIDDEN_REGEX } from '@app/helpers/regex';
import {IOrderType} from "@app/models/IOrder";

export interface OrderForm {
  orderType: FormControl<IOrderType>;
  title: FormControl<string>;
  invoice_reference: FormControl<string>;
  emailDeliverChoice: FormControl<string>;
  emailDeliver: FormControl<string>;
  description: FormControl<string>;
}

export interface ContactForm {
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

// Helper type for the Group itself
export type OrderFormGroup = FormGroup<OrderForm>;
