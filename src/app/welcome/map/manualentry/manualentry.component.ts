import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTab, MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';

import { IManualEntryDialogData } from '../../../_models/IManualEntryDialog';

@Component({
  selector: 'gs2-manualentry',
  templateUrl: './manualentry.component.html',
  styleUrls: ['./manualentry.component.scss'],
  imports: [
    MatTab, MatTabGroup, MatFormField, MatLabel, MatSelect, FormsModule, MatOption, MatFormField,
    MatDialogClose, MatSelectModule, ReactiveFormsModule, MatDialogModule
  ],
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
