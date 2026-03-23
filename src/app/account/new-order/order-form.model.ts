import {IOrderType} from "@app/models/IOrder";

import {FormControl} from '@angular/forms';

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
