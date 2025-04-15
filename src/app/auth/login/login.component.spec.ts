import { ConfigService } from '@app/services/config.service';
import { AppState } from '@app/store';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { OidcSecurityService, StsConfigLoader } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { LoginComponent } from './login.component';


class StoreMock {
  select = vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
}


class ConfigServiceMock {
  public config = {
  }
}

class StsConfigLoaderMock {
  loadConfigs = vi.fn().mockImplementation(() => of([]));
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        MatIconModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCardModule,
        MatInputModule,
        NoopAnimationsModule,
        LoginComponent,
      ],
      providers: [
        OidcSecurityService,
        { provide: StsConfigLoader, useClass: StsConfigLoaderMock },
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: Store<AppState>, useClass: StoreMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
