
import { IIdentity } from '@app/models/IIdentity';
import { ConfigService } from '@app/services/config.service';
import { AppState, getUser, isLoggedIn } from '@app/store';
import * as fromAuth from '@app/store/auth/auth.action';
import * as fromCart from '@app/store/cart/cart.action';

import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, filter } from 'rxjs/operators';




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
    private readonly store: Store<AppState>,
    private readonly config: ConfigService,
    private readonly oidcSecurityService: OidcSecurityService,
    private readonly router: Router) {
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

  goToSsoProfile() {
    this.oidcSecurityService.getConfiguration().pipe(
      map(config => config?.authority),
      filter((authority) => authority != null),
    ).subscribe((authority) => window.location.href = authority);
  }

  formatUsername(user: Partial<IIdentity> | null): string {
    if (user?.first_name && user?.last_name) {
      return user.first_name + ' ' + user.last_name;
    }
    return user?.username || '';
  }
}
