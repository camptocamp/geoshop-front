import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { OrderItemViewComponent } from '@app/components/order-item-view/order-item-view.component';
import * as Constants from '@app/constants';
import { WidgetHostDirective } from '@app/directives/widget-host.directive';
import { deepCopyOrder } from '@app/helpers/GeoshopUtils';
import { displayMiniMap } from '@app/helpers/geoHelper';
import { IOrderSummary, Order } from '@app/models/IOrder';
import { IProduct } from '@app/models/IProduct';
import { ApiOrderService } from '@app/services/api-order.service';
import { StoreService } from '@app/services/store.service';

import { CommonModule, DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, ComponentFactoryResolver, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Feature } from 'ol';
import Map from 'ol/Map';
import Geometry from 'ol/geom/Geometry';
import VectorSource from 'ol/source/Vector';


import { IconTextComponent } from '../../../shared/icon-text/icon-text.component';


// TODO tranlsate after updating SnackBar!
@Component({
  selector: 'gs2-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  imports: [
    DatePipe, IconTextComponent, MatIconModule, MatExpansionModule, MatDialogModule, CommonModule, MatButtonModule, WidgetHostDirective
  ],
})
export class OrderComponent {
  @Input() order: IOrderSummary;
  @Output() refreshOrders = new EventEmitter<number | null>();

  // Map
  @Input() minimap: Map;
  @Input() vectorSource: VectorSource<Feature<Geometry>>;

  // Order items
  @ViewChild(WidgetHostDirective) orderItemTemplate: WidgetHostDirective;
  selectedOrder: Order;

  // Constants
  readonly DOWNLOAD = Constants.DOWNLOAD;

  constructor(private cfr: ComponentFactoryResolver,
    private snackBar: MatSnackBar,
    private storeService: StoreService,
    private router: Router,
    private dialog: MatDialog,
    private apiOrderService: ApiOrderService) {
  }

  downloadOrder(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.order || !this.order.id || !this.order.download_guid) {
      return;
    }
    this.apiOrderService.downloadResult(this.order.download_guid).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const link = document.createElement('a');
        // TODO: resolve filename properly after upgrading to the latest Angular
        link.download = 'result.zip';
        link.href = window.URL.createObjectURL(response.body ?? new Blob());
        link.click();
        window.URL.revokeObjectURL(link.href);
      },
      error: (error) => {
        this.snackBar.open(error.detail ?? $localize`Aucun fichier disponible`, 'Ok', { panelClass: 'notification-info' });
      }
    });
  }

  duplicateInCart() {
    /**
     * Copy previous order to cart by resetting ids
     */
    if (this.selectedOrder) {
      const copy = deepCopyOrder(this.selectedOrder.toJson);
      copy.id = -1;
      for (const item of copy.items) {
        if ((item.product as IProduct).label !== undefined) {
          item.product = item.product as IProduct;
        }
        item.id = undefined;
        item.price = undefined;
        item.price_status = undefined;
        item.order = undefined;
        item.status = undefined;
      }
      this.storeService.addOrderToStore(new Order(copy));
      this.snackBar.open(
        $localize`La commande a été dupliquée dans votre panier.`, 'Ok', {
        panelClass: 'notification-info',
        duration: 5000,
      }
      );
      this.router.navigate(['']);
    }
  }

  pushBackToCart() {
    if (this.selectedOrder) {
      this.storeService.addOrderToStore(this.selectedOrder);
    }
  }

  confirmOrder() {
    let dialogRef: MatDialogRef<ConfirmDialogComponent> | null = this.dialog.open(ConfirmDialogComponent, {
      disableClose: false,
    });

    if (!dialogRef) {
      return;
    }

    dialogRef.componentInstance.noButtonTitle = $localize`Annuler`;
    dialogRef.componentInstance.yesButtonTitle = $localize`Confirmer`;
    dialogRef.componentInstance.confirmMessage = $localize`Etes-vous sûr de vouloir confimrer la commande?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiOrderService.confirmOrder(this.selectedOrder.id).subscribe(confirmed => {
          if (confirmed) {
            this.refreshOrders.emit();
          }
        });
      }
      dialogRef = null;
    });
  }

  deleteOrder(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    if (!this.order || !this.order.id) {
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
    dialogRef.componentInstance.confirmMessage = $localize`Etes-vous sûr de vouloir supprimer la commande "${this.order.title}" ?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.order.id) {
        this.apiOrderService.delete(this.order.id).subscribe(confirmed => {
          if (confirmed) {
            this.refreshOrders.emit(this.order.id);
          }
        });
      }
      dialogRef = null;
    });
  }

  displayMiniMap() {
    if (this.selectedOrder) {
      displayMiniMap(this.selectedOrder, [this.minimap], [this.vectorSource], 0);
      return;
    }

    this.apiOrderService.getOrder(this.order.url).subscribe((loadedOrder) => {
      if (loadedOrder) {
        this.selectedOrder = new Order(loadedOrder);
        this.order.statusAsReadableIconText = this.selectedOrder.statusAsReadableIconText;
        this.generateOrderItemsElements(this.selectedOrder);
        displayMiniMap(this.selectedOrder, [this.minimap], [this.vectorSource], 0);
      }
    });
  }

  private generateOrderItemsElements(order: Order) {
    const component = this.orderItemTemplate.viewContainerRef.createComponent(OrderItemViewComponent);
    component.instance.dataSource = order.items;
    component.instance.order = order;
    component.changeDetectorRef.detectChanges();
  }
}
