import { Component, HostBinding } from '@angular/core';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'gs2-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  imports: [
    LoginComponent,
  ],
})
export class AuthComponent {

  @HostBinding('class') class = 'main-container';

}
