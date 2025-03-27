import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SafeHtmlPipe } from 'src/app/_pipes/SafeHtmlPipe';

@Component({
  selector: 'gs2-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports: [SafeHtmlPipe]
})
export class ConfirmDialogComponent {

  public confirmMessage: string;
  public noButtonTitle = $localize`Non`;
  public yesButtonTitle = $localize`Oui`;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {
  }

}
