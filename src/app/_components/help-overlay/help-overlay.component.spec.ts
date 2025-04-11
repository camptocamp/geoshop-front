import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';

import { HelpOverlayComponent } from './help-overlay.component';


describe('HelpOverlayComponent', () => {
  let component: HelpOverlayComponent;
  let fixture: ComponentFixture<HelpOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HelpOverlayComponent,
        MatIconModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
