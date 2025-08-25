import { IManualEntryDialogData } from '@app/models/IManualEntryDialog';

import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'gs2-manualentry',
  templateUrl: './manualentry.component.html',
  styleUrls: ['./manualentry.component.scss'],
  imports: [
    MatTabsModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule, MatDialogModule,
    MatButtonModule, MatSelectModule, MatOptionModule, FormsModule, MatInputModule,
    CommonModule
  ],
})
export class ManualentryComponent {

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ManualentryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IManualEntryDialogData,
    private readonly fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      xmin: [null, [Validators.required]],
      ymin: [null, [Validators.required]],
      xmax: [null, [Validators.required]],
      ymax: [null, [Validators.required]],
    });
  }

  tostr(o: unknown): string {
    return JSON.stringify(o);
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.data.activeTab = tabChangeEvent.index;
  }
}
