import { Component, HostBinding } from '@angular/core';
import { ConfigService } from '../../_services/config.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'gs2-help-overlay',
  templateUrl: './help-overlay.component.html',
  styleUrls: ['./help-overlay.component.scss'],
  imports: [
    MatButtonModule, MatIconModule, CommonModule,
  ],
})
export class HelpOverlayComponent {

  @HostBinding('class') class = 'overlay-container';

  tariffsUrl: string;
  conditionsUrl: string;
  phoneLabel: string;
  phoneNumber: string;
  email: string;

  constructor(configService: ConfigService) {
    this.phoneLabel = configService.config?.contact.phone.label || '';
    this.phoneNumber = configService.config?.contact.phone.number || '';
    this.email = configService.config?.contact.email || '';
    this.conditionsUrl = configService.config?.contact.links.conditions || '';
    this.tariffsUrl = configService.config?.contact.links.tariffs || '';
  }


}
