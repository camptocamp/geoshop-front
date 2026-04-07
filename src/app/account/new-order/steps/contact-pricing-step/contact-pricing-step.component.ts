import {ContactForm, OrderForm} from "@app/account/new-order/order-form.model";
import {ConfirmDialogComponent} from "@app/components/confirm-dialog/confirm-dialog.component";
import * as Constants from "@app/constants";
import {Contact, IContact} from "@app/models/IContact";
import {IIdentity} from "@app/models/IIdentity";
import {IOrderType} from "@app/models/IOrder";
import {IProduct} from "@app/models/IProduct";
import {ApiOrderService} from "@app/services/api-order.service";
import {ApiService} from "@app/services/api.service";

import {CommonModule} from "@angular/common";
import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatButtonModule} from "@angular/material/button";
import {MatOptionModule} from "@angular/material/core";
import {MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatError, MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatStepperModule} from "@angular/material/stepper";
import {MatTableModule} from "@angular/material/table";
import {Observable} from "rxjs";
import {debounceTime, filter, map, mergeMap, startWith} from "rxjs/operators";

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
export class ContactPricingStepComponent implements OnInit {
  @Input() contactFormGroup: FormGroup<ContactForm>;
  @Input() orderFormGroup: FormGroup<OrderForm>;
  @Input() orderTypes: IOrderType[];
  @Input() products: IProduct[] = [];
  @Input() user: Partial<IIdentity> | null = null;

  public readonly AppConstants = Constants;
  private readonly destroyRef = inject(DestroyRef);

  public isSearchLoading = false;
  public isCustomerSelected = false;
  public isNewInvoiceContact = false;
  public currentSelectedContact: Contact | undefined;
  public filteredCustomers$: Observable<IContact[]> | undefined;

  constructor(
    private readonly apiService: ApiService,
    private readonly apiOrderService: ApiOrderService,
    private dialog: MatDialog,
  ) {
  }

  public ngOnInit() {
    this.filteredCustomers$ = this.contactFormGroup.get('customer')?.valueChanges.pipe(
      debounceTime(500),
      startWith(''),
      filter(x => typeof x === 'string' && x.length > 2),
      mergeMap(searchString => {
        this.isSearchLoading = true;
        return this.apiService.find<IContact>(searchString, 'contact');
      }),
      map(x => {
        this.isSearchLoading = false;
        return x ? x.results : [];
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  public get isOrderTypePrivate(): boolean {
    return this.orderFormGroup?.get('orderType')?.value.id === 1;
  }

  public getLocalizedTypeName(type: IOrderType): string {
    switch (type.id) {
      case 1:
        return Constants.ORDER_NAME.PRIVATE;
      case 2:
        return Constants.ORDER_NAME.PUBLIC;
    }
    return type.name;
  }

  get customerCtrl() {
    return this.contactFormGroup.get('customer');
  }

  get addressChoiceCtrl() {
    return this.contactFormGroup.get('addressChoice');
  }

  get IsAddressForCurrentUser(): boolean {
    return this.addressChoiceCtrl?.value === '1';
  }

  public resetCustomerSearch() {
    this.contactFormGroup.reset();
    this.isCustomerSelected = false;
    this.isNewInvoiceContact = false;
    this.currentSelectedContact = undefined;
    this.contactFormGroup.reset();
  }

  public displayCustomer(customer: IIdentity | Contact) {
    if (!customer) {
      return '';
    }
    return `${customer.first_name} ${customer.last_name} (${customer.email})`.trim();
  }

  public getInvoiceContact(): Contact | undefined {
    const actualContact: IContact = {
      ...this.contactFormGroup.getRawValue()
    };
    return actualContact.first_name && actualContact.last_name && actualContact.email ?
      new Contact(actualContact) :
      undefined;
  }

  public deleteCurrentContact() {
    const contact = this.getInvoiceContact();
    if (!this.isCustomerSelected || !contact?.Id) {
      return;
    }
    let dialogRef: MatDialogRef<ConfirmDialogComponent> | null = this.dialog.open(ConfirmDialogComponent, {
      disableClose: false,
    });

    if (!dialogRef) {
      return;
    }

    dialogRef.componentInstance.noButtonTitle = $localize`Annuler`;
    dialogRef.componentInstance.yesButtonTitle = $localize`Supprimer`;
    dialogRef.componentInstance.confirmMessage =
      $localize`Etes-vous sûr de vouloir supprimer le contact <b style='color:#26a59a;'>${contact.first_name} ${contact.last_name}</b> ?`;
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      dialogRef = null;
      if (!result) {
        return;
      }
      this.apiOrderService.deleteContact(contact.Id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(confirmed => {
        if (confirmed) {
          this.clearCustomerForm();
          this.isCustomerSelected = false;
          this.currentSelectedContact = undefined;
        }
      });
    });
  }

  public resetCustomerForm() {
    this.contactFormGroup.reset({
      customer: this.contactFormGroup.get("customer")?.value ?? "",
      ...this.currentSelectedContact,
    });
  }

  public clearCustomerForm() {
    this.contactFormGroup.reset({
      addressChoice: this.contactFormGroup.get("addressChoice")?.value ?? "1",
    });
    this.isCustomerSelected = true;
    this.isNewInvoiceContact = true;
  }

  public updateCustomerForm(event: MatAutocompleteSelectedEvent) {
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
