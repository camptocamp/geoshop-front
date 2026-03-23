import {ContactForm, OrderForm} from "@app/account/new-order/order-form.model";
import * as Constants from "@app/constants";
import {Contact, IContact} from "@app/models/IContact";
import {IIdentity} from "@app/models/IIdentity";
import {IOrderType} from "@app/models/IOrder";
import {IProduct} from "@app/models/IProduct";
import {ConfigService} from "@app/services/config.service";

import {CommonModule} from "@angular/common";
import {Component, Input} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule, UntypedFormGroup} from "@angular/forms";
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatButtonModule} from "@angular/material/button";
import {MatOptionModule} from "@angular/material/core";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatError, MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatStepperModule} from "@angular/material/stepper";
import {MatTableModule} from "@angular/material/table";
import {Observable} from "rxjs";

@Component({
  selector: 'gs2-contact-pricing-step',
  imports: [
    CommonModule, FormsModule, MatAutocompleteModule, MatButtonModule,
    MatDialogModule, MatError, MatFormFieldModule, MatIconModule, MatInputModule,
    MatOptionModule, MatProgressSpinnerModule, MatRadioButton, MatRadioGroup, MatSelectModule,
    MatStepperModule, MatTableModule, ReactiveFormsModule
  ],
  templateUrl: './contact-pricing-step.component.html',
  styleUrl: './contact-pricing-step.component.scss'
})
export class ContactPricingStepComponent {
  @Input() contactFormGroup: FormGroup<ContactForm>;
  @Input() orderFormGroup: FormGroup<OrderForm>;
  @Input() orderTypes: IOrderType[];
  @Input() products: IProduct[] = [];
  @Input() user: Partial<IIdentity>|null = null;
  @Input() addressChoiceForm: UntypedFormGroup;

  readonly AppConstants = Constants;

  isSearchLoading = false;
  isCustomerSelected = false;
  isNewInvoiceContact = false;
  currentSelectedContact: Contact | undefined;
  filteredCustomers$: Observable<IContact[]> | undefined;

  constructor(private readonly config: ConfigService) {
  }

  get IsOrderTypePrivate() {
    return this.orderFormGroup?.get('orderType')?.value?.id === 1;
  }

  public getLocalizedTypeName(type: IOrderType): string {
    switch (type.id) {
      case 1:
        return Constants.ORDER_NAME.PRIVATE;
      case 2:
        return Constants.ORDER_NAME.PUBLIC;
    };
    return type.name;
  }

  get customerCtrl() {
    return this.contactFormGroup.get('customer');
  }

  get addressChoiceCtrl() {
    return this.addressChoiceForm.get('addressChoice');
  }

  get IsAddressForCurrentUser() {
    return this.addressChoiceCtrl?.value === '1';
  }

  resetCustomerSearch() {
    this.contactFormGroup.reset();
    this.isCustomerSelected = false;
    this.isNewInvoiceContact = false;
    this.currentSelectedContact = undefined;
    this.contactFormGroup.reset();
  }

  displayCustomer(customer: IIdentity) {
    return customer ?
      customer.company_name ? customer.company_name :
        customer.first_name ? customer.first_name : '' : '';
  }

  public deleteCurrentContact() {
  //  alert("deleteCurrentContact");
  }

  public resetCustomerForm() {
 //   alert("resetCustomerForm");
  }

  clearCustomerForm() {
    this.contactFormGroup.reset();
    this.isCustomerSelected = true;
    this.isNewInvoiceContact = true;
    // this.updateContactForm('2');
    // for (const key in this.invoiceContactsFormControls) {
    //   if (key === 'country') {
    //     this.contactFormGroup.get(key)?.setValue(this.COUNTRIES.CH.name);
    //   } else {
    //     this.contactFormGroup.get(key)?.setValue('');
    //   }
    // }
  }

  updateCustomerForm(event: MatAutocompleteSelectedEvent) {
    this.isCustomerSelected = true;
    this.isNewInvoiceContact = false;

    const iContact: IContact = event.option.value;
    this.currentSelectedContact = new Contact(iContact);
    for (const key in iContact) {
      if (this.contactFormGroup.contains(key)) {
        this.contactFormGroup.get(key)?.setValue(iContact[key]);
      }
    }

    this.contactFormGroup.markAsPristine();
  }

}
