import {Component, ElementRef, HostBinding, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '../../_store';
import * as AuthActions from '../../_store/auth/auth.action';
import {ICredentials} from '../../_models/IIdentity';
import {ActivatedRoute} from '@angular/router';
import { ConstantsService } from 'src/app/constants.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ConfigService } from 'src/app/_services/config.service';

@Component({
    selector: 'gs2-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {

  @HostBinding('class') class = 'main-container';

  // Constants
  readonly REQUIRED = ConstantsService.REQUIRED;
  readonly LOGIN = ConstantsService.LOGIN;

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

  get oidcEnabled():boolean {
    return this.config.config?.oidcConfig ? true : false;
  }

  get localAuthEnabled():boolean {
    return this.config.config?.localAuthEnabled ? true: false;
  }

  oidcAuthClick() {
    this.oidcSecurityService.authorize();
  }
}
