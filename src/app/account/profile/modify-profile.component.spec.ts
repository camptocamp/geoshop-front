import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { ModifyProfileComponent } from './modify-profile.component';


describe('ModifyProfileComponent', () => {
  let component: ModifyProfileComponent;
  let fixture: ComponentFixture<ModifyProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModifyProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: {} },
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
