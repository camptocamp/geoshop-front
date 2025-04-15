import { AccountOverlayComponent } from '@app/components/account-overlay/account-overlay.component';
import { CartOverlayComponent } from '@app/components/cart-overlay/cart-overlay.component';
import { HelpOverlayComponent } from '@app/components/help-overlay/help-overlay.component';
import { ConfigService } from '@app/services/config.service';
import { AppState, getUser, selectCartTotal, selectOrder } from '@app/store';
import * as fromAuth from '@app/store/auth/auth.action';

import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { combineLatest, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'gs2-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet, RouterLink, AsyncPipe,
    MatBadgeModule, MatDividerModule, MatIconModule, MatToolbarModule, MatMenuModule, MatMenuTrigger,
    AccountOverlayComponent, CartOverlayComponent, HelpOverlayComponent, CommonModule, MatInputModule,
    MatFormFieldModule, MatButtonModule
  ],
})
export class AppComponent implements OnDestroy {

  private refreshTokenInterval: NodeJS.Timeout | number; // TODO this is breaking the build it was originaly set to type number
  private static autoLoginFailed = false;
  title = 'front';
  subTitle = '';

  order$ = this.store.select(selectOrder);
  numberOfItemInTheCart$ = this.store.select(selectCartTotal);

  constructor(
    private oidcService: OidcSecurityService,
    private configService: ConfigService,
    private store: Store<AppState>,
    private ngZone: NgZone,
    private router: Router,
  ) {
    const routerNavEnd$ = this.router.events.pipe(filter(x => x instanceof NavigationEnd));
    const params = new URLSearchParams(window.location.search);

    combineLatest([routerNavEnd$, this.store.select(selectCartTotal)])
      .subscribe((pair) => {
        const navEnd = pair[0];
        const numberOfItemInTheCart = pair[1];

        if (navEnd instanceof NavigationEnd) {
          if (navEnd.url.indexOf('orders') > -1) {
            this.subTitle = $localize`Mes commandes`;
          } else if (navEnd.url.indexOf('new-order') > -1 && numberOfItemInTheCart > 0) {
            this.subTitle = $localize`Votre commande de ${numberOfItemInTheCart} produits`;
          } else {
            this.subTitle = '';
          }
        }

        if (!params.get("bounds") && localStorage.getItem("bounds")) {
          this.ngZone.run(() => {
              this.router.navigateByUrl("/welcome?bounds=" + localStorage.getItem("bounds"));
          });
        }
      });

    const err = new URLSearchParams(window.location.search).get('error');
    if (err === "interaction_required") {
      AppComponent.autoLoginFailed = true;
    } else if (this.configService.config?.oidcConfig && !AppComponent.autoLoginFailed) {
      const authSubscription = new Subscription()
      combineLatest([this.oidcService.checkAuth(), this.store.select(getUser)]).subscribe(([loginResponse, user]) => {
        if (loginResponse.isAuthenticated && !user) {
          this.store.dispatch(fromAuth.oidcLogin(loginResponse));
        } else if (loginResponse.isAuthenticated && user) {
          if (this.refreshTokenInterval) {
            clearInterval(this.refreshTokenInterval);
          }
          if (user && user.tokenRefresh) {
            this.refreshTokenInterval = setInterval(() => {
              if (user.tokenRefresh) {
                this.store.dispatch(fromAuth.refreshToken({ token: user.tokenRefresh }));
              }
            }, 120000);
          }
        } else if (!AppComponent.autoLoginFailed) {
          const bounds = new URLSearchParams(window.location.search).get("bounds")
          if (bounds) {
              localStorage.setItem("bounds", bounds);
          }
          this.oidcService.authorize(undefined, { customParams: { prompt: 'none' } });
        }
        authSubscription.unsubscribe();
      });
    }
  }

  ngOnDestroy() {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }
  }

  get appLogo(): { path: string, alt: string } | undefined {
    return this.configService.config?.appLogo;
  }
}
