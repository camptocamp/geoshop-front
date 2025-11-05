import { IIdentity } from '@app/models/IIdentity';
import { AppState, getUser } from '@app/store';
import { oidcLogin, refreshToken } from '@app/store/auth/auth.action';

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, combineLatest, filter, map, Observable } from 'rxjs';

const TOKEN_REFRESH_INTERVAL = 120000;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly user$ = this.store.select(getUser);
  private readonly _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _refreshTokenInterval: NodeJS.Timeout;
  private silentAuthFailed = false;

  constructor(
    private readonly oidc: OidcSecurityService,
    private readonly store: Store<AppState>,
    private readonly router: Router,
  ) {
    this.user$.pipe(map((user) => !!user)).subscribe(this._isAuthenticated);
    this.user$.pipe(filter((user) => !!user)).subscribe((user) => this.scheduleTokenRefresh(user));
  }

  public checkAuth() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === "interaction_required") {
      this.silentAuthFailed = true;
      this.restoreState();
      return;
    }
    combineLatest([
      this.store.select(getUser),
      this.oidc.checkAuth()
    ]).subscribe(([gsAuth, oidcAuth]) => {
      if (!gsAuth && oidcAuth.isAuthenticated) {
        this.store.dispatch(oidcLogin(oidcAuth));
        this.silentAuthFailed = false;
      } else if (!gsAuth && !oidcAuth.isAuthenticated && !this.silentAuthFailed) {
        this.saveState();
        this.oidc.authorize(undefined, { customParams: { prompt: 'none' } });
      } else {
        this.restoreState();
      }
    });
  }

  private saveState() {
    window.sessionStorage.setItem("oidc_redirect", window.location.pathname);
  }

  private restoreState() {
    const originalTarget = window.sessionStorage.getItem("oidc_redirect");
    if (!originalTarget) {
      return
    }
    window.sessionStorage.removeItem("oidc_redirect");
    this.router.navigateByUrl(originalTarget.replace(/^\/de\//, "/"));
  }

  private scheduleTokenRefresh(user: Partial<IIdentity>) {
    if (!user || !user.tokenRefresh) {
      return;
    }
    const token = user.tokenRefresh;
    if (this._refreshTokenInterval) {
      clearInterval(this._refreshTokenInterval);
    }
    const store = this.store;
    this._refreshTokenInterval = setInterval(() => {
      store.dispatch(refreshToken({ token }));
    }, TOKEN_REFRESH_INTERVAL);
  }

  cleanup() {
    if (this._refreshTokenInterval) {
      clearInterval(this._refreshTokenInterval);
    }
  }

  get isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }
}
