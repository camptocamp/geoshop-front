import {Component, ComponentFactoryResolver, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {IOrderDowloadLink, IOrderSummary, Order} from '../../../_models/IOrder';
import {IProduct} from '../../../_models/IProduct';
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import {GeoHelper} from '../../../_helpers/geoHelper';
import {OrderItemViewComponent} from '../../../_components/order-item-view/order-item-view.component';
import {WidgetHostDirective} from '../../../_directives/widget-host.directive';
import {ApiOrderService} from '../../../_services/api-order.service';
import {GeoshopUtils} from '../../../_helpers/GeoshopUtils';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StoreService} from '../../../_services/store.service';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../_components/confirm-dialog/confirm-dialog.component';
import Geometry from 'ol/geom/Geometry';
import { ConstantsService } from '../../../constants.service';
import { Feature } from 'ol';
import { HttpResponse } from '@angular/common/http';

// TODO tranlsate after updating SnackBar!
@Component({
    selector: 'gs2-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'],
    standalone: false
})
export class OrderComponent implements OnInit {
  @Input() order: IOrderSummary;
  @Output() refreshOrders = new EventEmitter<number | null>();

  // Map
  @Input() minimap: Map;
  @Input() vectorSource: VectorSource<Feature<Geometry>>;

  // Order items
  @ViewChild(WidgetHostDirective) orderItemTemplate: WidgetHostDirective;
  selectedOrder: Order;

  // Constants
  readonly DOWNLOAD = ConstantsService.DOWNLOAD;

  constructor(private cfr: ComponentFactoryResolver,
              private snackBar: MatSnackBar,
              private storeService: StoreService,
              private router: Router,
              private dialog: MatDialog,
              private apiOrderService: ApiOrderService) {
  }

  ngOnInit(): void {
  }

  downloadOrder(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.order || !this.order.id) {
      return;
    }

    this.apiOrderService.downloadResult(this.order.download_guid!).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const link = document.createElement('a');
        // TODO: resolve filename properly after upgrading to the latest Angular
        link.download = 'result.zip';
        link.href = window.URL.createObjectURL(response.body!);
        link.click();
        window.URL.revokeObjectURL(link.href);
      },
      error: (error: any) => {
        this.snackBar.open(error.detail ?? $localize`Aucun fichier disponible`, 'Ok', { panelClass: 'notification-info' });
      }
    });
  }

  duplicateInCart() {
    /**
     * Copy previous order to cart by resetting ids
     */
    if (this.selectedOrder) {
      const copy = GeoshopUtils.deepCopyOrder(this.selectedOrder.toJson);
      copy.id = -1;
      for (const item of copy.items) {
        if ((item.product as IProduct).label !== undefined) {
          item.product = (item.product as IProduct).label;
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
      GeoHelper.displayMiniMap(this.selectedOrder, [this.minimap], [this.vectorSource], 0);
      return;
    }

    this.apiOrderService.getOrder(this.order.url).subscribe((loadedOrder) => {
      if (loadedOrder) {
        this.selectedOrder = new Order(loadedOrder);
        this.order.statusAsReadableIconText = this.selectedOrder.statusAsReadableIconText;
        this.generateOrderItemsElements(this.selectedOrder);
        GeoHelper.displayMiniMap(this.selectedOrder, [this.minimap], [this.vectorSource], 0);
      }
    });
  }

  private generateOrderItemsElements(order: Order) {
    const componentFac = this.cfr.resolveComponentFactory(OrderItemViewComponent);
    const component = this.orderItemTemplate.viewContainerRef.createComponent(componentFac);
    component.instance.dataSource = order.items;
    component.instance.order = order;
    component.changeDetectorRef.detectChanges();
  }
}
