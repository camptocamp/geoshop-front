import {OrderForm} from "@app/account/new-order/order-form.model";
import * as Constants from '@app/constants';
import {EMAIL_REGEX} from "@app/helpers/regex";
import {IIdentity} from "@app/models/IIdentity";
import {IOrderType} from "@app/models/IOrder";
import {IProduct} from "@app/models/IProduct";
import {ConfigService} from "@app/services/config.service";

import {CommonModule} from "@angular/common";
import {Component, Input, OnInit} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
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

@Component({
  selector: 'gs2-order-type-step',
  imports: [
    CommonModule, FormsModule, MatAutocompleteModule, MatButtonModule,
    MatDialogModule, MatError, MatFormFieldModule, MatIconModule, MatInputModule,
    MatOptionModule, MatProgressSpinnerModule, MatRadioButton, MatRadioGroup, MatSelectModule,
    MatStepperModule, MatTableModule, ReactiveFormsModule
  ],
  templateUrl: './order-type-step.component.html',
  styleUrl: './order-type-step.component.scss'
})
export class OrderTypeStepComponent implements OnInit {
  @Input() orderFormGroup: FormGroup<OrderForm>;
  @Input() products: IProduct[] = [];
  @Input() user: Partial<IIdentity>|null = null;
  @Input() orderTypes: IOrderType[] = [];

  public readonly AppConstants = Constants;

  constructor(private readonly config: ConfigService) {
  }

  ngOnInit() {
    this.orderFormGroup.get('emailDeliverChoice')?.valueChanges.subscribe(value => {
      const emailControl = this.orderFormGroup.get('emailDeliver');
      if (value === '2') {
        emailControl?.setValidators([Validators.required, Validators.pattern(EMAIL_REGEX)]);
      } else {
        emailControl?.setValue('');
        emailControl?.setValidators([Validators.pattern(EMAIL_REGEX)]);
      }
      emailControl?.updateValueAndValidity();
    });
  }

  public orderTypeCompareWith(a: IOrderType, b: IOrderType): boolean {
    return a && b && a.id === b.id;
  }

  public onTypeSelected(type: IOrderType) {
    this.orderFormGroup.get('orderType')?.setValue(type);
    const descriptionControl = this.orderFormGroup.get('description');
    if (type.id === 1) {
      descriptionControl?.setValue('');
      descriptionControl?.clearValidators();
    } else {
      descriptionControl?.setValidators(Validators.required);
    }
    descriptionControl?.updateValueAndValidity();
    this.orderFormGroup.updateValueAndValidity();
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

  public billingRequired(): boolean {
    return !this.config.config?.noBillingForFreeOrder ||
      !this.products.every(product => product.pricing?.pricing_type === "FREE");
  }
}
