import {OrderItemForm} from "@app/account/new-order/order-form.model";
import * as Constants from "@app/constants";
import {IOrder, IOrderItem, Order} from "@app/models/IOrder";
import {ApiOrderService} from "@app/services/api-order.service";
import {StoreService} from "@app/services/store.service";

import { CommonModule, CurrencyPipe} from "@angular/common";
import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {FormArray, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatButtonModule} from "@angular/material/button";
import {MatOptionModule} from "@angular/material/core";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSelectModule} from "@angular/material/select";
import {MatStepperModule} from "@angular/material/stepper";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';


@Component({
  selector: 'gs2-data-format-step',
  imports: [
    CommonModule, CurrencyPipe, FormsModule, MatAutocompleteModule, MatButtonModule,
    MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatOptionModule, MatProgressSpinnerModule, MatSelectModule,
    MatStepperModule, MatTableModule, ReactiveFormsModule
  ],
  templateUrl: './data-format-step.component.html',
  styleUrl: './data-format-step.component.scss'
})
export class DataFormatStepComponent {

  @Input() dataSource: MatTableDataSource<IOrderItem>;
  @Input() orderItemFormGroup: FormGroup<OrderItemForm>;
  @Input() allAvailableFormats: Set<string> = new Set<string>();
  @Input() order: Order;

  public readonly displayedColumns: string[] = ['label', 'format', 'price'];
  public isOrderPatchLoading = false;

  constructor(
    private readonly apiOrderService: ApiOrderService,
    private readonly storeService: StoreService,
    private cdr: ChangeDetectorRef
  ) {
  }

  get hasPendingItem(): boolean {
    return this.order && this.order.isAllOrderItemCalculated;
  }

  public getProductLabel(orderItem: IOrderItem): string {
    return Order.getProductLabel(orderItem);
  }

  public updateAllDataFormats(dataFormatName: string) {
    this.isOrderPatchLoading = true;
    this.order.items.forEach((item, i) => {
      const availableFormats = item.available_formats || [];
      if (availableFormats.indexOf(dataFormatName) > -1) {
        item.data_format = dataFormatName;
        const formatControl = (this.orderItemFormGroup.get("format") as FormArray).at(i);
        if (formatControl) {
          formatControl.setValue(dataFormatName);
        }
      }
    });
    this.apiOrderService.updateOrderItemsDataFormats(this.order).subscribe(newOrder => {
      if (newOrder) {
        this.storeService.addOrderToStore(new Order(newOrder as IOrder));
      }
      this.isOrderPatchLoading = false;
      this.cdr.detectChanges();
    });
    this.cdr.detectChanges();
  }

  // FIXME this is a duplication of the same function in the order-item-view.component.ts
  public getOrerStatus(orderItem: IOrderItem): string {
    let returnValue = '';
    if (orderItem.status !== undefined && Constants.ORDER_STATUS[orderItem.status]) {
      returnValue = Constants.ORDER_STATUS[orderItem.status];
    }
    return returnValue;
  }

  public updateDataFormat(item: IOrderItem, selectedFormat: string, index: number) {
    item.data_format = selectedFormat;
    const formatControl = (this.orderItemFormGroup.get("format") as FormArray).at(index);
    if (formatControl) {
      formatControl.setValue(selectedFormat);
    }
    this.cdr.detectChanges();
  }
}
