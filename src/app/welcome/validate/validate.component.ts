import { generateMiniMap, displayMiniMap } from '@app/helpers/geoHelper';
import {IContact} from "@app/models/IContact";
import { IOrderItem, Order } from '@app/models/IOrder';
import { ApiOrderService } from '@app/services/api-order.service';
import { AuthService } from '@app/services/auth.service';
import { ConfigService } from '@app/services/config.service';
import { MapService } from '@app/services/map.service';

import { CommonModule, LowerCasePipe } from '@angular/common';
import {Component, DestroyRef, HostBinding, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import {filter, map, switchMap, skipUntil, take, tap} from 'rxjs/operators';

interface ValidationData {
  order: Order | null;
  item: IOrderItem | null;
  contact: IContact | null;
}

@Component({
  selector: 'gs2-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss'],
  imports: [
    MatCardModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, LowerCasePipe, MatButtonModule, CommonModule,
    RouterLink, ReactiveFormsModule,
  ],
})
export class ValidateComponent implements OnInit {

  @HostBinding('class') class = 'main-container';

  public token$: Observable<string>;
  public orderData$: Observable<ValidationData>;
  public isAuthenticated$ = this.auth.isAuthenticated;
  public reason = new FormControl<string>('');

  constructor(
    private readonly apiOrderService: ApiOrderService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly configService: ConfigService,
    private readonly auth: AuthService,
    private readonly mapService: MapService,
    private readonly destroyRef: DestroyRef,
    ) {

    this.token$ = this.route.params.pipe(takeUntilDestroyed(this.destroyRef), map(params => params.token));
  }

  private initValidationData(token: string): Observable<ValidationData> {
    return this.apiOrderService.getOrderItemByToken(token).pipe(
      map(item => ({ item, order: null, contact: null }))
    );
  }

  private addOrderData(data: ValidationData): Observable<ValidationData> {
    if (!data.item?.order_guid) {
      return of(data);
    }
    return this.apiOrderService.getOrderByUUID(data.item.order_guid).pipe(map(order => ({ ...data, order })));
  }

  private addContactData(data: ValidationData): Observable<ValidationData> {
    if (!data.order?.invoice_contact) {
      return of(data);
    }
    return this.apiOrderService.getContact(data.order.invoice_contact).pipe(map(contact => ({ ...data, contact })));
  }

  public ngOnInit(): void {
    this.orderData$ = this.token$.pipe(
      skipUntil(this.isAuthenticated$.pipe(filter((value) => value))),
      switchMap(token => this.initValidationData(token)),
      switchMap(data => this.addOrderData(data)),
      switchMap(data => this.addContactData(data)),
      tap((data) => {
        this.reason.setValue(data.item?.validation_reason ?? "");
      })
    );

    this.orderData$.pipe(
      map(data => data.order),
      filter(order => !!order),
    ).subscribe(order => {
      generateMiniMap(this.configService, this.mapService).then(async result => {
        // a delay is needed so that the DOM has finished rendering and the target of
        // type `mini-map-${order.id}` exists
        // TODO: improve this sync part with proper Angular logics (await for render)
        // angular experts needed ;-)
        // set timeout is a workaround which fixes the race condition.
        // setTimeout(() => displayMiniMap(order, [result.minimap], [result.vectorSource], 0), 50);
        // 50ms is too short, do active wait for element
        // waitForElementToDisplay(`#mini-map-${order.id}`, () => displayMiniMap(order, [result.minimap], [result.vectorSource], 0), 100, 5000);
        await displayMiniMap(order, [result.minimap], [result.vectorSource], 0)
      });
    });
  }

  public proceedOrder(isAccepted: boolean) {
    this.token$.pipe(
        switchMap(token => this.apiOrderService.updateOrderItemStatus(token, this.reason.value ?? "", isAccepted)),
        filter(confirmed => confirmed),
        take(1)
      ).subscribe(() =>  this.router.navigate(['/welcome']));
  }
}

