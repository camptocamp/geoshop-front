import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IManualEntryDialogData } from '../../../_models/IManualEntryDialog';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'gs2-manualentry',
  templateUrl: './manualentry.component.html',
  styleUrls: ['./manualentry.component.scss'],
  
})
export class ManualentryComponent {

  constructor(
    public dialogRef: MatDialogRef<ManualentryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IManualEntryDialogData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.data.activeTab = tabChangeEvent.index;
  }
}
