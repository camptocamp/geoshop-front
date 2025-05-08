import { AppState } from '@app/store';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { StsConfigLoader } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AccountOverlayComponent } from './account-overlay.component';


class StoreMock {
  select = vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
}

describe('AccountOverlayComponent', () => {
  let component: AccountOverlayComponent;
  let fixture: ComponentFixture<AccountOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AccountOverlayComponent,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        StsConfigLoader,
        { provide: Store<AppState>, useClass: StoreMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
