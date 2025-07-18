import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { AppState } from '../_store';
import { Store } from '@ngrx/store';
import * as fromAuth from '../_store/auth/auth.action';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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

function formatGenericError(err: any): string {
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

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private store: Store<AppState>, private router: Router, private snackBar: MatSnackBar) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(
      catchError(response => {
        if (response instanceof HttpErrorResponse) {
          if (response.status === 401 || response.status === 403) {
            this.store.dispatch(fromAuth.logout());
            this.router.navigate(['/auth/login']);
            return of();
          } else {
            let message = "";
            const err = response.error;
            // TODO: Better error type recognition
            if (!err.message && response.url) {
              message = formatConnectionError(response);
            } else if (Array.isArray(err.message) && err.message[0] === 'Order area is too large') {
              message = formatAreaError(err);
            } else if (JSON.stringify(err.message).toLowerCase().indexOf("token expired") !== -1){
              message = $localize`La session est expirée`;
            } else {
              message = formatGenericError(err);
            }
            if (message.length === 0) {
              message = response.message;
            }
            this.snackBar.open(message, 'Ok', { panelClass: 'notification-error' });
          }
        }

        return throwError(response);
      })
    );
  }

}
