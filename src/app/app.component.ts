import { AccountOverlayComponent } from '@app/components/account-overlay/account-overlay.component';
import { CartOverlayComponent } from '@app/components/cart-overlay/cart-overlay.component';
import { HelpOverlayComponent } from '@app/components/help-overlay/help-overlay.component';
import { SearchComponent } from '@app/components/search/search.component';
import { ConfigService } from '@app/services/config.service';
import { AppState, selectCartTotal, selectOrder } from '@app/store';
import * as MapAction from '@app/store/map/map.action';

import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'gs2-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet, RouterLink, AsyncPipe,
    MatBadgeModule, MatDividerModule, MatIconModule, MatToolbarModule, MatMenuModule, MatMenuTrigger,
    AccountOverlayComponent, CartOverlayComponent, HelpOverlayComponent, CommonModule, MatInputModule,
    MatFormFieldModule, MatButtonModule, SearchComponent
  ],
})
export class AppComponent implements OnDestroy, OnInit {

  title = 'front';
  subTitle = '';
  showSearch = false;

  order$ = this.store.select(selectOrder);
  numberOfItemInTheCart$ = this.store.select(selectCartTotal);
  isLoggedIn$ = this.auth.isAuthenticated;

  constructor(
    private configService: ConfigService,
    private store: Store<AppState>,
    private router: Router,
    private readonly auth: AuthService,
  ) {
  }

  ngOnInit(): void {

    const routerNavEnd$ = this.router.events.pipe(filter(x => x instanceof NavigationEnd));

    // This URL permalink listener must be in app.component during startup of the app
    // URL is decoded first of all into the mapState
    const initialParams = routerNavEnd$.subscribe(() => {
      const params = new URLSearchParams(window.location.search);
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
            this.showSearch = false;
          } else if (navEnd.url.indexOf('new-order') > -1 && numberOfItemInTheCart > 0) {
            this.subTitle = $localize`Votre commande de ${numberOfItemInTheCart} produits`;
            this.showSearch = false;
          } else {
            this.subTitle = '';
            this.showSearch = true;
          }
        }
      });

    this.auth.checkAuth();
  }

  ngOnDestroy() {
    this.auth.cleanup();
  }

  get appLogo(): { path: string, alt: string } | undefined {
    return this.configService.config?.appLogo;
  }

  get appLogo1(): { path: string, alt: string } | undefined {
    return this.configService.config?.appLogo1;
  }
}
