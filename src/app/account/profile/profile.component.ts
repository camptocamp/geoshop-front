import { Component, HostBinding, OnInit } from '@angular/core';
import { ApiService } from '../../_services/api.service';
import { IUser } from '../../_models/IUser';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'gs2-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    RouterLink, MatIconModule, MatCardModule, FormsModule, ReactiveFormsModule, CommonModule,
    MatButtonModule
  ],
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
