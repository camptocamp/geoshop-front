import { Component, HostBinding } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMAIL_REGEX } from '../../_helpers/regex';
import { ApiService } from '../../_services/api.service';
import { MatError, MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'gs2-forget',
  templateUrl: './forget.component.html',
  styleUrls: ['./forget.component.scss'],
  imports: [
    MatError, FormsModule, ReactiveFormsModule, MatIconModule, MatCardModule, MatFormFieldModule, CommonModule, MatInputModule, MatButtonModule
  ],
})
export class ForgetComponent {

  @HostBinding('class') class = 'main-container';

  private readonly successMessage = $localize`Le mot de passe a été envoyé à l\'adresse : `;
  form: UntypedFormGroup;

  get email() {
    return this.form.get('email');
  }

  constructor(private fb: UntypedFormBuilder,
    private router: Router,
    public snackBar: MatSnackBar,
    private apiService: ApiService
  ) {
    this.form = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEX)])],
    });
  }

  onSubmit(event: MouseEvent) {
    event.preventDefault();

    if (!this.form.valid) {
      return;
    }

    this.apiService.forget(this.form.value.email)
      .subscribe((result) => {
        if (!result) {
          return;
        } else {
          this.snackBar.open(`${this.successMessage} ${this.form.value.email}`,
            'Ok', { panelClass: 'notification-success' });
          this.router.navigate(['']);
        }
      });
  }
}
