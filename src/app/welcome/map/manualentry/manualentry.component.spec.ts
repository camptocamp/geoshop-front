import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualentryComponent } from './manualentry.component';
import { IManualEntryDialogData } from '../../../_models/IManualEntryDialog';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { IPageFormat } from 'src/app/_models/IConfig';

export class MatDialogRefMock {
  close(value = '') {

  }
}

describe('ManualentryComponent', () => {
  let component: ManualentryComponent;
  let fixture: ComponentFixture<ManualentryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManualentryComponent],
      imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        MatSelectModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: {
          selectedPageFormatScale: 1,
          pageFormatScales: [0],
          selectedPageFormat: {name: "A", height: 10, width: 10} as IPageFormat,
          pageFormats: Array<IPageFormat>({name: "A", height: 10, width: 10}),
          PageFormatRotation: 0,
          rotationPageFormat: 0,
          activeTab: 0,
          xMin: 0,
          yMin: 0,
          xMax: 0,
          yMax: 0,
        } as IManualEntryDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManualentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
