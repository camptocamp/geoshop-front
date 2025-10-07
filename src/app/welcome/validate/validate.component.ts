import { generateMiniMap, displayMiniMap } from '@app/helpers/geoHelper';
import { IOrderItem, Order } from '@app/models/IOrder';
import { ApiOrderService } from '@app/services/api-order.service';
import { ConfigService } from '@app/services/config.service';
import { MapService } from '@app/services/map.service';

import { CommonModule, LowerCasePipe } from '@angular/common';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';


@Component({
  selector: 'gs2-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss'],
  imports: [
    MatCardModule, MatProgressSpinnerModule, LowerCasePipe, MatButtonModule, CommonModule,
    RouterLink
  ],
})
export class ValidateComponent implements OnInit, OnDestroy {

  @HostBinding('class') class = 'main-container';

  private onDestroy$ = new Subject<void>();
  token$: Observable<string>;
  orderData$: Observable<{ order: Order | null, item: IOrderItem | null }>;


  constructor(
    private apiOrderService: ApiOrderService,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private mapService: MapService) {
    this.token$ = this.route.params
      .pipe(
        takeUntil(this.onDestroy$),
        map(params => params.token)
      );
  }

  ngOnInit(): void {
    this.orderData$ = this.token$.pipe(
      mergeMap(token => this.apiOrderService.getOrderItemByToken(token)),
      mergeMap(
        item => item ? this.apiOrderService.getOrderByUUID(item.order_guid).pipe(
          map(order => ({ order, item }))) : of({ order: null, item: null })
      )
    );

    this.orderData$.pipe(
      map(data => data.order),
      filter(order => !!order),
    ).subscribe(order => {
      generateMiniMap(this.configService, this.mapService).then(result => {
        // a delay is needed so that the DOM has finished rendering and the target of
        // type `mini-map-${order.id}` exists
        // TODO: improve this sync part with proper Angular logics (await for render)
        // angular experts needed ;-)
        // set timeout is a workaround which fixes the race condition.
        setTimeout(() => displayMiniMap(order, [result.minimap], [result.vectorSource], 0), 50);
      });
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  proceedOrder(isAccepted: boolean) {
    this.token$.subscribe(token => {
      this.apiOrderService.updateOrderItemStatus(token, isAccepted).subscribe(async confirmed => {
        if (confirmed) {
          await this.router.navigate(['/welcome']);
        }
      });
    });
  }
}
