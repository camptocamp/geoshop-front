import { IUser } from '@app/models/IUser';
import { ApiService } from '@app/services/api.service';

import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';




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
