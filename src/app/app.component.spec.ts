import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { StsConfigLoader } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it , vi } from 'vitest';

import { AccountOverlayComponent } from './_components/account-overlay/account-overlay.component';
import { CartOverlayComponent } from './_components/cart-overlay/cart-overlay.component';
import { HelpOverlayComponent } from './_components/help-overlay/help-overlay.component';
import { AppState } from './_store';
import { AppComponent } from './app.component';

class StoreMock {
  select = vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
}

describe('AppComponent', () => {
  global.ResizeObserver = global.ResizeObserver || vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        CommonModule,
        MatRippleModule,
        MatBadgeModule,
        MatMenuModule,
        MatIconModule,
        MatDividerModule,
        MatToolbarModule,
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule,
        AppComponent,
        AccountOverlayComponent,
        HelpOverlayComponent,
        CartOverlayComponent,
      ],
      providers: [
        StsConfigLoader,
        { provide: ActivatedRoute, useValue: { params: of([{ id: 1 }]) } },
        { provide: Store<AppState>, useClass: StoreMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'front'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('front');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('GeoShop Title');
  });
});
