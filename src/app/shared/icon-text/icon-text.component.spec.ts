import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { IconTextComponent } from './icon-text.component';

describe('IconTextComponent', () => {
  let component: IconTextComponent;
  let fixture: ComponentFixture<IconTextComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IconTextComponent,
        MatButton,
        MatIcon
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
