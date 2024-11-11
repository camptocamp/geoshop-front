import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogMetadataComponent } from './dialog-metadata.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { IMetadata } from 'src/app/_models/IMetadata';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatAccordion } from '@angular/material/expansion';

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
      ],
      declarations: [DialogMetadataComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: HttpClient, useClass: HttpClient },
        { provide: HttpHandler, useClass: HttpHandler },
        { provide: MAT_DIALOG_DATA, useValue: {geocat_link: ""} as IMetadata }
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
