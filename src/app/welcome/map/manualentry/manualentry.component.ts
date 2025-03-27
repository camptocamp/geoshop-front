import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { IManualEntryDialogData } from '../../../_models/IManualEntryDialog';
import { MatTab, MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'gs2-manualentry',
  templateUrl: './manualentry.component.html',
  styleUrls: ['./manualentry.component.scss'],
  imports: [
    MatTab, MatTabGroup, MatFormField, MatLabel, MatSelect, FormsModule, MatOption, MatFormField,
    MatDialogClose, MatSelectModule, ReactiveFormsModule,
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
