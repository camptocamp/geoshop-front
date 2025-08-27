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
import { Extent } from 'ol/extent';
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
            rotationPageFormat: 0,
            activeTab: 0,
            extent: [2500000, 1180000, 2580000, 1240000] as Extent,
            constraints: [2500000, 1180000, 2580000, 1240000] as Extent
          } as IManualEntryDialogData
        }
      ]
    }).compileComponents();

  });

  function setExtent(component: ManualentryComponent, extent: Extent|null){
    const bounds = extent ?? [null, null, null, null];
    component.form.controls['xmin'].setValue(bounds[0]);
    component.form.controls['ymin'].setValue(bounds[1]);
    component.form.controls['xmax'].setValue(bounds[2]);
    component.form.controls['ymax'].setValue(bounds[3]);
  }

  function expectError(component: ManualentryComponent, error: string) {
    expect(component.form.invalid).toBe(true);
    for (const f of ["xmin", "ymin", "xmax", "ymax"]) {
      expect(component.form.controls['xmin'].hasError(error)).toBe(true);
    }
  }

  it('should create', () => {
    const fixture = TestBed.createComponent(ManualentryComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not allow empty values in extent', () => {
    const fixture = TestBed.createComponent(ManualentryComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    setExtent(component, null);
    expectError(component, 'required');
  });

  it('should not allow values below minimum', () => {
    const fixture = TestBed.createComponent(ManualentryComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    setExtent(component, [2500000 - 1, 1180000 - 1, 2500000 - 1, 1180000 - 1]);
    expectError(component, 'min');
  });

  it('should not allow values above maximum minimum', () => {
    const fixture = TestBed.createComponent(ManualentryComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    setExtent(component, [2580000 + 1, 1240000 + 1, 2580000 + 1, 1240000 + 1]);
    expectError(component, 'max');
  });

  it('should allow valid values in extent', () => {
    const fixture = TestBed.createComponent(ManualentryComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    setExtent(component, [2500000, 1180000, 2580000, 1240000]);

    expect(component.form.valid).toBe(true);
  });
});
