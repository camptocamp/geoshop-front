import { AccountOverlayComponent } from '@app/components/account-overlay/account-overlay.component';
import { CartOverlayComponent } from '@app/components/cart-overlay/cart-overlay.component';
import { HelpOverlayComponent } from '@app/components/help-overlay/help-overlay.component';
import { ConfigService } from '@app/services/config.service';
import { AppState, getUser, selectCartTotal, selectOrder } from '@app/store';
import * as AuthAction from '@app/store/auth/auth.action';
import * as MapAction from '@app/store/map/map.action';

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
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { combineLatest, Subscription, BehaviorSubject } from 'rxjs';
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

  // State holder for the login status so the constructor's auth subscription can update it.
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private oidcService: OidcSecurityService,
    private configService: ConfigService,
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const params = new URLSearchParams(window.location.search);
    const routerNavEnd$ = this.router.events.pipe(filter(x => x instanceof NavigationEnd));

    // This URL permalink listener must be in app.component during startup of the app
    // URL is decoded first of all into the mapState
    const initialParams = routerNavEnd$.subscribe(() => {
      const bounds = params.get("bounds")?.split(",").map(parseFloat);
      if (!bounds || bounds.length !== 4) {
        return;
      }
      this.store.dispatch(MapAction.saveState({
        state: { bounds: [bounds[0], bounds[1], bounds[2], bounds[3]] },
      }));
      // URL shall be decoded only once, later URL changes (from panning the map)
      // shall not reload the view
      initialParams.unsubscribe();
    });

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
      });
    if (params.get('error') === "interaction_required") {
      AppComponent.autoLoginFailed = true;
    }
    if (this.configService.config?.oidcConfig && !AppComponent.autoLoginFailed) {
      const authSubscription = new Subscription()
      combineLatest([this.oidcService.checkAuth(), this.store.select(getUser)]).subscribe(([loginResponse, user]) => {
        const loggedIn = !!(loginResponse?.isAuthenticated && user);
        // log and push the current login state so templates/reactive consumers update
        this.isLoggedInSubject.next(loggedIn);

        if (loginResponse.isAuthenticated && !user) {
          this.store.dispatch(AuthAction.oidcLogin(loginResponse));
        } else if (loginResponse.isAuthenticated && user) {
          if (this.refreshTokenInterval) {
            clearInterval(this.refreshTokenInterval);
          }
          if (user && user.tokenRefresh) {
            this.refreshTokenInterval = setInterval(() => {
              if (user.tokenRefresh) {
                this.store.dispatch(AuthAction.refreshToken({ token: user.tokenRefresh }));
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

  get appLogo1(): { path: string, alt: string } | undefined {
    return this.configService.config?.appLogo1;
  }
}
