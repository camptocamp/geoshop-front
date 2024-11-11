import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OidcComponent } from './oidc.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { AppState } from 'src/app/_store';
import { OidcSecurityService, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
}

describe('OidcComponent', () => {
  let component: OidcComponent;
  let fixture: ComponentFixture<OidcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OidcComponent ],
      providers:[
        OidcSecurityService,
        {provide: Store<AppState>, useClass: StoreMock},
        HttpClient,
        HttpHandler,
        {provide: StsConfigLoader, useValue:new StsConfigStaticLoader([])}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OidcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
