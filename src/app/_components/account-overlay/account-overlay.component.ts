import {Component, HostBinding, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState, getUser, isLoggedIn} from '../../_store';
import * as fromAuth from '../../_store/auth/auth.action';
import * as fromCart from '../../_store/cart/cart.action';
import { ConfigService } from 'src/app/_services/config.service';

@Component({
  selector: 'gs2-account-overlay',
  templateUrl: './account-overlay.component.html',
  styleUrls: ['./account-overlay.component.scss']
})
export class AccountOverlayComponent implements OnInit {

  @HostBinding('class') class = 'overlay-container';

  isLoggedIn$ = this.store.select(isLoggedIn);
  user$ = this.store.select(getUser);

  constructor(private store: Store<AppState>, private readonly configService: ConfigService) {
  }

  ngOnInit(): void {
  }

  logout() {
    this.store.dispatch(fromCart.deleteOrder());
    this.store.dispatch(fromAuth.logout());
  }

  public isRegistrationEnabled():boolean {
    return (this.configService.config?.features.indexOf('registration') ?? -1) >= 0;
  }
}
