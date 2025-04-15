import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { SafeHtmlPipe } from '../../pipes/SafeHtmlPipe';

@Component({
  selector: 'gs2-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports: [SafeHtmlPipe, MatDialogModule, MatButtonModule]
})
export class ConfirmDialogComponent {

  public confirmMessage: string;
  public noButtonTitle = $localize`Non`;
  public yesButtonTitle = $localize`Oui`;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {
  }

}
