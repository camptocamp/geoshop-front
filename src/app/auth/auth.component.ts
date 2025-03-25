import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'gs2-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],

})
export class AuthComponent {

  @HostBinding('class') class = 'main-container';

  constructor() {
  }

}
