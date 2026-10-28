import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'gs2-maintenance-banner',
  templateUrl: './maintenance-banner.component.html',
  styleUrls: ['./maintenance-banner.component.scss'],
  imports: [
    CommonModule, MatButtonModule, MatIconModule
  ],
})
export class MaintenanceBannerComponent {

  @Input() message = '';

  @Output() dismissed = new EventEmitter<void>();
}
