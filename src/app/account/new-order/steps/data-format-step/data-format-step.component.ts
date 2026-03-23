import * as Constants from "@app/constants";
import {IOrderItem, Order} from "@app/models/IOrder";

import { CommonModule, CurrencyPipe} from "@angular/common";
import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormGroup} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatButtonModule} from "@angular/material/button";
import {MatOptionModule} from "@angular/material/core";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatError, MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSelectModule} from "@angular/material/select";
import {MatStepperModule} from "@angular/material/stepper";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';


@Component({
  selector: 'gs2-data-format-step',
  imports: [
    CommonModule, CurrencyPipe, FormsModule, MatAutocompleteModule, MatButtonModule,
    MatDialogModule, MatError, MatFormFieldModule, MatIconModule, MatInputModule,
    MatOptionModule, MatProgressSpinnerModule, MatSelectModule,
    MatStepperModule, MatTableModule, ReactiveFormsModule
  ],
  templateUrl: './data-format-step.component.html',
  styleUrl: './data-format-step.component.scss'
})
export class DataFormatStepComponent {

  @Input() dataSource: MatTableDataSource<IOrderItem>;
  @Input() orderItemFormGroup: UntypedFormGroup;
  @Input() allAvailableFormats: Set<string> = new Set<string>();
  @Input() order: Order;

  readonly displayedColumns: string[] = ['label', 'format', 'price'];
  readonly AppConstants = Constants;

  isOrderPatchLoading = false;
  isOrderHasPendingItem = false;

  getProductLabel(orderItem: IOrderItem) {
    return Order.getProductLabel(orderItem);
  }

  getOrderItemControlName(orderItem: IOrderItem) {
    return `${orderItem.id}_${Order.getProductLabel(orderItem)}`;
  }

  // FIXME this is a duplication of the same function in the order-item-view.component.ts
  getOrerStatus(orderItem: IOrderItem): string {
    let returnValue = '';
    if (orderItem.status !== undefined && Constants.ORDER_STATUS[orderItem.status]) {
      returnValue = Constants.ORDER_STATUS[orderItem.status];
    }
    return returnValue;
  }
}
