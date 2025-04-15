import { ConfirmDialogComponent } from '@app/components/./confirm-dialog/confirm-dialog.component';
import { deepCopyOrder } from '@app/helpers/GeoshopUtils';
import { IOrder, Order } from '@app/models/IOrder';
import { IProduct } from '@app/models/IProduct';
import { ApiOrderService } from '@app/services/api-order.service';
import { ApiService } from '@app/services/api.service';
import { MapService } from '@app/services/map.service';
import { AppState, isLoggedIn, selectOrder } from '@app/store';
import * as fromCart from '@app/store/cart/cart.action';
import { DialogMetadataComponent } from '@app/welcome/catalog/dialog-metadata/dialog-metadata.component';

import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnDestroy, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';




@Component({
  selector: 'gs2-cart-overlay',
  templateUrl: './cart-overlay.component.html',
  styleUrls: ['./cart-overlay.component.scss'],
  imports: [
    MatTooltipModule, MatIconModule, MatDividerModule, MatButtonModule, CommonModule, MatDialogModule,
    MatMenuModule,
  ],
})
export class CartOverlayComponent implements OnDestroy {

  @Output() refreshOrders = new EventEmitter<number | null>();

  @HostBinding('class') class = 'overlay-container';

  order: IOrder;
  products: IProduct[] = [];

  private isUserLoggedIn = false;
  private onDestroy$ = new Subject();

  constructor(private store: Store<AppState>,
    private dialog: MatDialog,
    public mapService: MapService,
    private apiService: ApiService,
    private apiOrderService: ApiOrderService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.store.select(isLoggedIn).subscribe(x => this.isUserLoggedIn = x);
    this.store.select(selectOrder).subscribe(x => {
      this.order = x;
      this.products = this.order.items.map(o => o.product as IProduct);
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
  }

  removeProduct(label: string) {
    const order = deepCopyOrder(this.order);
    const orderItem = order.items.filter(x => Order.getProductLabel(x) === label)[0];
    if (orderItem.id) {
      this.apiOrderService.deleteOrderItem(orderItem.id).subscribe(confirmed => {
        if (confirmed) {
          this.refreshOrders.emit(this.order.id);
        }
      });
    }
    order.items = order.items.filter(x => Order.getProductLabel(x) !== label);
    this.store.dispatch(fromCart.updateOrder({ order }));
  }

  openMetadata(product: IProduct) {
    if (product.metadataObject) {
      this.dialog.open(DialogMetadataComponent, {
        width: '60%',
        height: '90%',
        data: product.metadataObject,
        autoFocus: false,
      });
    } else {
      this.apiService.loadMetadata(product.metadata)
        .subscribe(result => {
          if (result) {

            const order = deepCopyOrder(this.order);
            for (const item of order.items) {
              if (typeof item.product !== 'string') {
                if (item.product.label === product.label) {
                  item.product.metadataObject = result;
                  break;
                }
              }
            }

            this.store.dispatch(fromCart.updateOrder({ order }));
            this.dialog.open(DialogMetadataComponent, {
              width: '60%',
              height: '90%',
              data: result,
              autoFocus: false,
            });
          } else {
            this.snackBar.open($localize`Métadonnée indisponible pour le moment.`, 'Fermer', { duration: 3000 });
          }
        });
    }
  }

  deleteCart() {
    let dialogRef: MatDialogRef<ConfirmDialogComponent> | null = this.dialog.open(ConfirmDialogComponent, {
      disableClose: false,
    });
    dialogRef.componentInstance.confirmMessage = $localize`Voulez-vous supprimer le panier (remise à zéro) ?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(fromCart.deleteOrder());
      }
      dialogRef = null;
    });
  }

  naviguateToNewOrder() {
    if (this.isUserLoggedIn) {

      this.router.navigate(['/account/new-order'], {
        queryParams: {
          callback: '/account/new-order'
        }
      });
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: {
          callback: '/account/new-order'
        }
      });
    }
  }
}
