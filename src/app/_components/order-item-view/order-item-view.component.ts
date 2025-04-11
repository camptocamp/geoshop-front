import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { IOrderItem, Order } from '../../_models/IOrder';
import { ApiOrderService } from '../../_services/api-order.service';
import * as Constants from '../../constants';


@Component({
  selector: 'gs2-order-item-view',
  templateUrl: './order-item-view.component.html',
  styleUrls: ['./order-item-view.component.scss'],
  imports: [MatTableModule, CurrencyPipe, CommonModule]
})
export class OrderItemViewComponent implements OnInit {

  displayedColumns: string[] = ['product', 'format', 'price'];
  @Input() dataSource: IOrderItem[];
  @Input() order: Order;
  @Input() showAction = true;

  // Constants
  readonly DOWNLOAD = Constants.DOWNLOAD;

  constructor(private apiOrderService: ApiOrderService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    if (this.showAction) {
      this.displayedColumns.push('download');
    }
  }

  getProductLabel(orderItem: IOrderItem) {
    return Order.getProductLabel(orderItem);
  }

  getOrderStatus(orderItem: IOrderItem): string {
    let returnValue = '';
    if (orderItem.status !== undefined && Constants.ORDER_STATUS[orderItem.status]) {
      returnValue = Constants.ORDER_STATUS[orderItem.status];
    }
    return returnValue;
  }

  downloadOrder(event: MouseEvent, item: IOrderItem) {
    event.stopPropagation();
    event.preventDefault();
    if (!item.download_guid) {
      return
    }
    this.apiOrderService.downloadResult(item.download_guid).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const link = document.createElement('a');
        // TODO: resolve filename properly after upgrading to the latest Angular
        link.download = 'result.zip';
        link.href = window.URL.createObjectURL(response.body || new Blob);
        link.click();
        window.URL.revokeObjectURL(link.href);
      },
      error: (error) => {
        this.snackBar.open(error.detail ?? $localize`Aucun fichier disponible`, 'Ok', { panelClass: 'notification-info' });
      }
    });
  }
}
