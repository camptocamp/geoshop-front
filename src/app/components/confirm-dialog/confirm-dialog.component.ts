import { StripHtmlPipe } from '@app/pipes/strip-html.pipe';

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'gs2-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports: [StripHtmlPipe, MatDialogModule, MatButtonModule]
})
export class ConfirmDialogComponent {

  public confirmMessage: string;
  public noButtonTitle = $localize`Non`;
  public yesButtonTitle = $localize`Oui`;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {
  }

}
