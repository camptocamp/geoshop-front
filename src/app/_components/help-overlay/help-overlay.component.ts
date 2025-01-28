import {Component, HostBinding, OnInit} from '@angular/core';
import {ConfigService} from '../../_services/config.service';

@Component({
    selector: 'gs2-help-overlay',
    templateUrl: './help-overlay.component.html',
    styleUrls: ['./help-overlay.component.scss'],
    standalone: false
})
export class HelpOverlayComponent implements OnInit {

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

  ngOnInit(): void {
  }



}
