import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AppState } from 'src/app/_store';
import * as AuthActions from '../../_store/auth/auth.action';

@Component({
    selector: 'gs2-callback',
    templateUrl: './oidc.component.html',
    styleUrls: ['./oidc.component.scss'],
    standalone: false
})
export class OidcComponent implements OnInit {

  constructor(
    private readonly store: Store<AppState>,
    private readonly oidcSecurityService: OidcSecurityService) {
  }

  ngOnInit(): void {
    this.oidcSecurityService.checkAuth().subscribe(
      (response) => this.store.dispatch(AuthActions.oidcLogin(response)));
  }
}
