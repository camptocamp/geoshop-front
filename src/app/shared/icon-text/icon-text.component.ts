import { Component, Input } from '@angular/core';

@Component({
  selector: 'gs2-icon-text',
  templateUrl: './icon-text.component.html',
  styleUrls: ['./icon-text.component.scss'],

})
export class IconTextComponent {

  @Input() matIconName = '';
  @Input() text = '';
  @Input() fontColor = 'palegreen';
  @Input() fontSize = 24;

  constructor() {
  }

}
