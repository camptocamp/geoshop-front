import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

import { deleteOrder } from './cart.action';
import { MapService } from '../../_services/map.service';
import { StoreService } from '../../_services/store.service';

@Injectable()
export class CartEffects {
  constructor(
    private action$: Actions,
    private mapService: MapService,
    private storeService: StoreService,
  ) {
  }

  deleteOrder$ = createEffect(() =>
    this.action$.pipe(
      ofType(deleteOrder),
      tap(() => {
        this.storeService.IsLastDraftAlreadyLoadedOrChecked = false;
        this.mapService.eraseDrawing();
      })
    ), {
    dispatch: false
  }
  );
}
