import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AppState, getUser, selectCartTotal, selectOrder } from './_store';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AccountOverlayComponent } from './_components/account-overlay/account-overlay.component';
import { HelpOverlayComponent } from './_components/help-overlay/help-overlay.component';
import { CartOverlayComponent } from './_components/cart-overlay/cart-overlay.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
}

describe('AppComponent', () => {
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
        MatTooltipModule
      ],
      declarations: [
        AppComponent,
        AccountOverlayComponent,
        HelpOverlayComponent,
        CartOverlayComponent,
      ],
      providers: [
        {provide: Store<AppState>, useClass: StoreMock},
        HttpClient,
        HttpHandler
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
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('front app is running!');
  });
});
