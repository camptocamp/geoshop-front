import { Component, computed, OnDestroy } from '@angular/core';
import { AppState, getUser, selectCartTotal, selectMapState, selectOrder } from './_store';
import { Store } from '@ngrx/store';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { combineLatest, Subscription, zip } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import * as fromAuth from './_store/auth/auth.action';
import { ConfigService } from './_services/config.service';
import * as MapAction from './_store/map/map.action';

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
    private router: Router,
    private route: ActivatedRoute
  ) {
    const params = new URLSearchParams(window.location.search);
    const routerNavEnd$ = this.router.events.pipe(filter(x => x instanceof NavigationEnd));

    const initialParams = routerNavEnd$.subscribe(() => {
      const bounds = params.get("bounds")?.split(",").map(parseFloat);
      if (!bounds || bounds.length !== 4) {
        initialParams.unsubscribe();
        return;
      }
      this.store.dispatch(MapAction.saveState({
        state: { bounds: [bounds[0], bounds[1], bounds[2], bounds[3]] },
      }));
    });

    this.store.select(selectMapState).subscribe((mapState) => {
      const bounds = mapState.bounds;
      this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { bounds: bounds.join(",") },
            queryParamsHandling: 'merge'
          });
    });

    combineLatest([routerNavEnd$, this.store.select(selectCartTotal), this.store.select(selectMapState)])
      .subscribe((pair) => {
        const navEnd = pair[0];
        const numberOfItemInTheCart = pair[1];
        const mapState = pair[2];
        if (navEnd instanceof NavigationEnd) {
          if (navEnd.url.indexOf('orders') > -1) {
            this.subTitle = $localize`Mes commandes`;
          } else if (navEnd.url.indexOf('new-order') > -1 && numberOfItemInTheCart > 0) {
            this.subTitle = $localize`Votre commande de ${numberOfItemInTheCart} produits`;
          } else {
            this.subTitle = '';
          }
        }
      });
    if (params.get('error') === "interaction_required") {
      AppComponent.autoLoginFailed = true;
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
