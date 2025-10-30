import { AppState } from '@app/store';
import * as fromAuth from '@app/store/auth/auth.action';

import { HttpRequest, HttpEvent, HttpErrorResponse, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

function formatArea(area: number): string {
  return area > 100000 ?
    `${Math.round((area / 1000000) * 100) / 100}km²` :
    `${Math.round(area * 100) / 100}m²`;
}

function formatAreaError(err: { message: [string], excluded: [number], actual: [number] }): string {
  return $localize`Selected area is too large, selected: ${formatArea(err.actual[0])}, overflow: ${formatArea(err.excluded[0])}`;
}

function formatConnectionError(response: HttpErrorResponse): string {
  return $localize`Unexpected error: ${response.message}`;
}

function formatGenericError(err: Record<string, unknown>): string {
  const messages = [];
  for (const attr in err) {
    if (!err[attr]) {
      continue;
    }
    if (Array.isArray(err[attr])) {
      messages.push(...err[attr]);
    } else if (err[attr] === 'string') {
      messages.push(err[attr]);
    }
  }
  return messages.join("\n");
}

export const interceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const snackBar = inject(MatSnackBar);
  const store = inject(Store<AppState>);
  const router = inject(Router);
  return next(req).pipe(
    catchError(response => {
      if (response instanceof HttpErrorResponse) {
        if (response.status === 401) {
          store.dispatch(fromAuth.loginFailure({
            error: {detail: 'Unauthorized'}, message: 'Unauthorized', name: 'Unauthorized', status: 401,
          }));
          router.navigate(['/auth/login']);
        } else {
          let message = "";
          const err = response.error;
          // TODO: Better error type recognition
          // the item below is checked with highest priority
          // TODO allow exceptions: expected API errors should not lead to an error in snack bar
          if (response.url?.includes('validate/orderitem') && (response.status == 404)) {
            message = $localize`Token not found`;
            return throwError(() => response);
          } else if (!err.message && response.url) {
            message = formatConnectionError(response);
          } else if (Array.isArray(err.message) && err.message[0] === 'Order area is too large') {
            message = formatAreaError(err);
          } else if (JSON.stringify(err.message).toLowerCase().indexOf("token expired") !== -1) {
            message = $localize`La session est expirée`;
          } else {
            message = formatGenericError(err);
          }
          if (message.length === 0) {
            message = response.message;
          }
          snackBar.open(message, 'Ok', { panelClass: 'notification-error' });
        }
      }

      return throwError(() => response);
    }));
}

