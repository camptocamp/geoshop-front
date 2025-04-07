import { vi } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountOverlayComponent } from './account-overlay.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../_store';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StsConfigLoader } from 'angular-auth-oidc-client';

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
