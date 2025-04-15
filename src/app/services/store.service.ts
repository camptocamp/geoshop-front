import { Order } from '@app/models/IOrder';
import { AppState } from '@app/store';
import { updateOrder } from '@app/store/cart/cart.action';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';



@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private isLastDraftAlreadyLoadedOrChecked = false;

  public get IsLastDraftAlreadyLoadedOrChecked() {
    return this.isLastDraftAlreadyLoadedOrChecked;
  }

  public set IsLastDraftAlreadyLoadedOrChecked(isLoaded: boolean) {
    this.isLastDraftAlreadyLoadedOrChecked = isLoaded;
  }

  constructor(private store: Store<AppState>) {
  }

  public addOrderToStore(order: Order) {
    if (order.items.length === 0) {
      this.store.dispatch(updateOrder({
        order: order.toJson
      }));
      return;
    }
    this.store.dispatch(updateOrder({
      order: order.toJson
    }));
  }
}
