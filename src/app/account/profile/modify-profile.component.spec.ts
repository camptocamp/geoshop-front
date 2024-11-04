import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyProfileComponent } from './modify-profile.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';

describe('ModifyProfileComponent', () => {
  let component: ModifyProfileComponent;
  let fixture: ComponentFixture<ModifyProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyProfileComponent ],
      providers: [
        HttpClient,
        HttpHandler,
        {provide: MatDialogRef, useValue: {}},
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
