import { IPageFormat } from '@app/models/IConfig';
import { IManualEntryDialogData } from '@app/models/IManualEntryDialog';

import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { vi, describe, it, beforeEach, expect } from 'vitest';

import { ManualentryComponent } from './manualentry.component';

export class MatDialogRefMock {
  close = vi.fn();
}

describe('ManualentryComponent', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        MatTabGroup,
        MatSelectModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        {
          provide: MAT_DIALOG_DATA, useValue: {
            selectedPageFormatScale: 1,
            pageFormatScales: [0],
            selectedPageFormat: { name: "A", height: 10, width: 10 } as IPageFormat,
            pageFormats: Array<IPageFormat>({ name: "A", height: 10, width: 10 }),
            PageFormatRotation: 0,
            rotationPageFormat: 0,
            activeTab: 0,
            xMin: 0,
            yMin: 0,
            xMax: 0,
            yMax: 0,
          } as IManualEntryDialogData
        }
      ]
    }).compileComponents();

  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ManualentryComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
