import { Component, OnDestroy } from '@angular/core';
import { AppState, authFeatureSelector, getUser, selectCartTotal, selectOrder } from './_store';
import { Store } from '@ngrx/store';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
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

  title = 'front';
  subTitle = '';

  order$ = this.store.select(selectOrder);
  numberOfItemInTheCart$ = this.store.select(selectCartTotal);

  constructor(
    private oidcService: OidcSecurityService,
    private configService: ConfigService,
    private store: Store<AppState>,
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    const routerNavEnd$ = this.router.events.pipe(filter(x => x instanceof NavigationEnd));

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

    const err = new URLSearchParams(window.location.search).get('error');
    if (err === "interaction_required") {
      this.store.dispatch(fromAuth.oidcAutoLoginFailure());
    } else if (this.configService.config?.oidcConfig) {
      this.oidcService.checkAuth().subscribe((lr: LoginResponse) => {
        if (lr.isAuthenticated) {
          this.store.dispatch(fromAuth.oidcLogin(lr));
        } else {
          this.store.select(authFeatureSelector).pipe(
            filter((feature) => !feature.autoLoginFailed)
          ).subscribe(() => this.oidcService.authorize(undefined, {customParams:{prompt: 'none'}}))
        }
      });
    }

    this.store.select(getUser).subscribe(user => {
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
    });
  }

  ngOnDestroy() {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }
  }
}
