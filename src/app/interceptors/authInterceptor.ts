import { AppState } from '@app/store';
import * as fromRoot from '@app/store/index';

import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first, mergeMap } from 'rxjs/operators';




export const interceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const store = inject(Store<AppState>);
  return store.select(fromRoot.getToken).pipe(
    first(),
    mergeMap(token => next(token ? req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }) : req)));
}
