import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { ConfigService } from '../../_services/config.service';
import { AppState, getUser, isLoggedIn } from '../../_store';
import * as fromAuth from '../../_store/auth/auth.action';
import * as fromCart from '../../_store/cart/cart.action';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'gs2-account-overlay',
  templateUrl: './account-overlay.component.html',
  styleUrls: ['./account-overlay.component.scss'],
  imports: [
    MatIconModule, AsyncPipe, RouterLink, CommonModule, MatButtonModule, MatMenuModule
  ],
})
export class AccountOverlayComponent {

  @HostBinding('class') class = 'overlay-container';

  isLoggedIn$ = this.store.select(isLoggedIn);
  user$ = this.store.select(getUser);

  constructor(
    private store: Store<AppState>,
    private readonly config: ConfigService,
    private readonly oidcSecurityService: OidcSecurityService) {
  }

  get oidcEnabled(): boolean {
    return this.config.config?.oidcConfig ? true : false;
  }

  get localAuthEnabled(): boolean {
    return this.config.config?.localAuthEnabled ? true : false;
  }

  oidcAuthClick() {
    this.oidcSecurityService.authorize();
  }

  notifyLogout() {
    this.store.dispatch(fromCart.deleteOrder());
    this.store.dispatch(fromAuth.logout());
  }

  logout() {
    if (this.oidcEnabled) {
      this.oidcSecurityService.logoffAndRevokeTokens().subscribe(() => this.notifyLogout());
    } else {
      this.notifyLogout();
    }
  }
}
