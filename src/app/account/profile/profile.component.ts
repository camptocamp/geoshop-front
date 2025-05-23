import {Component, HostBinding, OnInit} from '@angular/core';
import {ApiService} from '../../_services/api.service';
import {IUser} from '../../_models/IUser';


@Component({
    selector: 'gs2-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: false
})
export class ProfileComponent implements OnInit {

  @HostBinding('class') class = 'main-container';

  user: IUser;

  constructor(private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.apiService.getProfile()
      .subscribe(user => {
        this.user = user;
      });
  }
}
