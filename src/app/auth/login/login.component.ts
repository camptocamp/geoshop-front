import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatError, MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { ICredentials } from '../../_models/IIdentity';
import { ConfigService } from '../../_services/config.service';
import { AppState } from '../../_store';
import * as AuthActions from '../../_store/auth/auth.action';
import * as Constants from '../../constants';




@Component({
  selector: 'gs2-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    MatCardModule, MatIconModule, RouterLink, MatError, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, CommonModule, MatInputModule, MatButtonModule,
  ],
})
export class LoginComponent implements OnInit {

  @HostBinding('class') class = 'main-container';

  // Constants
  readonly REQUIRED = Constants.REQUIRED;
  readonly LOGIN = Constants.LOGIN;

  form: UntypedFormGroup = new UntypedFormGroup({
    username: new UntypedFormControl('', Validators.required),
    password: new UntypedFormControl('', Validators.required),
  });

  get username() {
    return this.form.get('username');
  }

  get password() {
    return this.form.get('password');
  }

  private callbackUrl: string;

  constructor(private store: Store<AppState>, private route: ActivatedRoute,
    private el: ElementRef,
    private readonly config: ConfigService,
    private readonly oidcSecurityService: OidcSecurityService) {
    this.route.queryParams.subscribe(queryParams => {
      this.callbackUrl = queryParams.callback;
    });
  }

  ngOnInit(): void {
    if (!this.localAuthEnabled) {
      this.oidcSecurityService.authorize();
      return
    }
    const input = this.el.nativeElement.querySelector('[formcontrolname="username"]');
    if (input && input instanceof HTMLInputElement) {
      input.focus();
    }
  }

  submit() {
    if (this.form.valid) {
      const payload: { credentials: ICredentials, callbackUrl: string } = {
        credentials: {
          username: this.username?.value,
          password: this.password?.value
        },
        callbackUrl: this.callbackUrl,
      };
      this.store.dispatch(AuthActions.login(payload));
    }
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
}
