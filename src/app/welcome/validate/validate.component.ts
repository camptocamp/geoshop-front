import { CommonModule, LowerCasePipe } from '@angular/common';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Feature } from 'ol';
import Map from 'ol/Map';
import Geometry from 'ol/geom/Geometry';
import VectorSource from 'ol/source/Vector';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { generateMiniMap, displayMiniMap } from '../../_helpers/geoHelper';
import { Order, OrderItem } from '../../_models/IOrder';
import { ApiOrderService } from '../../_services/api-order.service';
import { ConfigService } from '../../_services/config.service';
import { MapService } from '../../_services/map.service';



@Component({
  selector: 'gs2-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss'],
  imports: [
    MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatProgressSpinner, MatCardSubtitle,
    LowerCasePipe, MatCardActions, CommonModule,
  ],
})
export class ValidateComponent implements OnInit, OnDestroy {

  @HostBinding('class') class = 'main-container';

  private onDestroy$ = new Subject<void>();
  private token: string;
  order: Order;
  orderitem: OrderItem;
  minimap: Map;
  vectorSource: VectorSource<Feature<Geometry>>;


  constructor(
    private apiOrderService: ApiOrderService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private mapService: MapService) {
    this.route.params
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(params => this.token = params.token);
  }

  ngOnInit(): void {
    this.apiOrderService.getOrderItemByToken(this.token)
      .subscribe(iOrderItem => {
        if (iOrderItem) {
          this.orderitem = new OrderItem(iOrderItem);
          this.apiOrderService.getOrderByUUID(iOrderItem.order_guid).pipe(takeUntil(this.onDestroy$))
            .subscribe(order => {
              if (order) {
                this.order = order;
                generateMiniMap(this.configService, this.mapService).then(result => {
                  this.minimap = result.minimap;
                  this.vectorSource = result.vectorSource;
                  displayMiniMap(this.order, [this.minimap], [this.vectorSource], 0);
                });
              }
            });
        } else {
          this.router.navigate(['/welcome']);
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  proceedOrder(isAccepted: boolean) {
    this.apiOrderService.updateOrderItemStatus(this.token, isAccepted).subscribe(async confirmed => {
      if (confirmed) {
        await this.router.navigate(['/welcome']);
      }
    });
  }
}
