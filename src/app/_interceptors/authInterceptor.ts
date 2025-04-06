import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AppState } from '../_store';
import { Store } from '@ngrx/store';
import * as fromRoot from '../_store/index';
import { first, mergeMap } from 'rxjs/operators';


export const interceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const store = inject(Store<AppState>);
  return store.select(fromRoot.getToken).pipe(
    first(),
    mergeMap(token => next(token ? req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }) : req)));
}
