import { Component, HostBinding } from '@angular/core';
import { ConfigService } from '../../_services/config.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gs2-help-overlay',
  templateUrl: './help-overlay.component.html',
  styleUrls: ['./help-overlay.component.scss'],
  imports: [
    MatIcon, MatIconModule, CommonModule,
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
