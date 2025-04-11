import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { DialogMetadataComponent } from './dialog-metadata.component';

import { IMetadata } from '../../../_models/IMetadata';


describe('DialogMetadataComponent', () => {
  let component: DialogMetadataComponent;
  let fixture: ComponentFixture<DialogMetadataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatCardModule,
        MatIconModule,
        MatAccordion,
        DialogMetadataComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: { geocat_link: "" } as IMetadata }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
