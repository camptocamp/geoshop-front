import { CommonModule, DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Feature } from 'ol';
import Map from 'ol/Map';
import Geometry from 'ol/geom/Geometry';
import VectorSource from 'ol/source/Vector';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrderItemViewComponent } from '../../_components/order-item-view/order-item-view.component';
import { generateMiniMap, displayMiniMap } from '../../_helpers/geoHelper';
import { Order } from '../../_models/IOrder';
import { ApiOrderService } from '../../_services/api-order.service';
import { ConfigService } from '../../_services/config.service';
import { MapService } from '../../_services/map.service';


import * as Constants from '../../constants';




@Component({
  selector: 'gs2-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
  imports: [
    MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatProgressSpinner,
    DatePipe, MatIcon, OrderItemViewComponent, CommonModule,
  ],
})
export class DownloadComponent implements OnInit, OnDestroy {

  @HostBinding('class') class = 'main-container';

  private onDestroy$ = new Subject<void>();
  private uuid: string;
  order: Order;
  minimap: Map;
  vectorSource: VectorSource<Feature<Geometry>>;

  // Constants
  readonly DOWNLOAD = Constants.DOWNLOAD;

  constructor(
    private apiOrderService: ApiOrderService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private mapService: MapService) {
    this.route.params
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(params => this.uuid = params.uuid);
  }

  ngOnInit(): void {
    this.apiOrderService.getOrderByUUID(this.uuid)
      .pipe(takeUntil(this.onDestroy$))
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
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  downloadOrder(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    this.apiOrderService.downloadResult(this.uuid).subscribe({
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

}
