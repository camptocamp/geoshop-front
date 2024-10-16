import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OidcComponent } from './oidc.component';

describe('OidcComponent', () => {
  let component: OidcComponent;
  let fixture: ComponentFixture<OidcComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OidcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OidcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
