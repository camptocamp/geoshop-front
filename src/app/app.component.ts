import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AppState, authFeatureSelector, getUser, selectCartTotal, selectOrder } from './_store';
import { Store } from '@ngrx/store';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { combineLatest, Subscription, zip } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import * as fromAuth from './_store/auth/auth.action';
import { ConfigService } from './_services/config.service';

@Component({
  selector: 'gs2-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnDestroy {

  private refreshTokenInterval: NodeJS.Timeout | number; // TODO this is breaking the build it was originaly set to type number
  private static autoLoginFailed: boolean = false;
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

    if (params.get('error') === "interaction_required") {
      AppComponent.autoLoginFailed = true;
      return
    }
    if (this.configService.config?.oidcConfig && !AppComponent.autoLoginFailed) {
      let authSubscription = new Subscription()
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
