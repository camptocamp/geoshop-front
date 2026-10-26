import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceBannerComponent } from './maintenance-banner.component';


describe('MaintenanceBannerComponent', () => {
  let component: MaintenanceBannerComponent;
  let fixture: ComponentFixture<MaintenanceBannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MaintenanceBannerComponent,
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the message it receives', () => {
    component.message = 'Maintenance';
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('.banner-message').textContent;
    expect(text).toBe('Maintenance');
  });

  it('should emit on a click on the close button', () => {
    let dismissCount = 0;
    component.dismissed.subscribe(() => dismissCount++);

    fixture.nativeElement.querySelector('.banner-close').click();

    expect(dismissCount).toBe(1);
  });
});
