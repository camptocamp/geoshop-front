import { Component, Input, OnInit } from '@angular/core';
import { IOrderItem, Order } from '../../_models/IOrder';
import { ApiOrderService } from '../../_services/api-order.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ConstantsService } from '../../constants.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'gs2-order-item-view',
  templateUrl: './order-item-view.component.html',
  styleUrls: ['./order-item-view.component.scss']
})
export class OrderItemViewComponent implements OnInit {

  displayedColumns: string[] = ['product', 'format', 'price'];
  @Input() dataSource: IOrderItem[];
  @Input() order: Order;
  @Input() showAction = true;

  // Constants
  readonly DOWNLAOD = ConstantsService.DOWNLAOD;

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
    let returnValue: string = '';
    if (orderItem.status !== undefined && ConstantsService.ORDER_STATUS.hasOwnProperty(orderItem.status)) {
      returnValue = ConstantsService.ORDER_STATUS[orderItem.status];
    }
    return returnValue;
  }

  downloadOrder(event: MouseEvent, item: IOrderItem) {
    event.stopPropagation();
    event.preventDefault();

    this.apiOrderService.downloadResult(item.download_guid!).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const link = document.createElement('a');
        // TODO: resolve filename properly after upgrading to the latest Angular
        link.download = 'result.zip';
        link.href = window.URL.createObjectURL(response.body!);
        link.click();
        window.URL.revokeObjectURL(link.href);
      },
      error: (error: any) => {
        this.snackBar.open(error.detail ?? 'Aucun fichier disponible', 'Ok', { panelClass: 'notification-info' });
      }
    });
  }
}
