import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IManualEntryDialogData} from '../../../_models/IManualEntryDialog';
import {MatTabChangeEvent} from '@angular/material/tabs';

@Component({
    selector: 'gs2-manualentry',
    templateUrl: './manualentry.component.html',
    styleUrls: ['./manualentry.component.scss'],
    standalone: false
})
export class ManualentryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ManualentryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IManualEntryDialogData,
  ) { }

  ngOnInit(): void { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.data.activeTab = tabChangeEvent.index;
  }
}
