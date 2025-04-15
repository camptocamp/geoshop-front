import * as Constants from '@app/constants';
import { ApiService } from '@app/services/api.service';

import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatError, MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';



@Component({
  selector: 'gs2-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
  imports: [
    MatError, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatCardModule, CommonModule, MatInputModule
  ],
})
export class ResetComponent implements OnDestroy {

  @HostBinding('class') class = 'main-container';

  private onDestroy$ = new Subject<void>();

  private token: string;
  private uid: string;
  private successMessage = 'Votre nouveau mot de passe a bien été pris en compte. Vous pouvez vous authentifier.';

  // Constants
  readonly REQUIRED = Constants.REQUIRED

  passwords = new UntypedFormGroup({
    password: new UntypedFormControl('', Validators.required),
    passwordConfirm: new UntypedFormControl('', Validators.required),
  }, this.passwordMatchValidator);

  get password() {
    return this.passwords.get('password');
  }

  get passwordConfirm() {
    return this.passwords.get('passwordConfirm');
  }

  constructor(private apiService: ApiService, private snackBar: MatSnackBar,
    private router: Router, private route: ActivatedRoute) {
    this.route.params
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(params => {
        this.token = params.token;
        this.uid = params.uid;
      });
  }

  submit() {
    if (this.passwords.valid) {
      this.apiService.resetPassword(this.password?.value, this.passwordConfirm?.value, this.uid, this.token)
        .subscribe(async (result) => {
          if (!result) {
            return;
          } else {
            await this.router.navigate(['/auth/login']);
            this.snackBar.open(this.successMessage, 'Ok', { panelClass: 'notification-success' });
          }
        });
    }
  }

  private passwordMatchValidator(g: UntypedFormGroup) {
    const passValue = g.get('password')?.value;
    const passConfirmValue = g.get('passwordConfirm')?.value;
    return passValue === passConfirmValue ? null : { mismatch: true };
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

}
