import { AppState } from '@app/store';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { CartOverlayComponent } from './cart-overlay.component';



class StoreMock {
  select = vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
}

describe('CartOverlayComponent', () => {
  let component: CartOverlayComponent;
  let fixture: ComponentFixture<CartOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CartOverlayComponent,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: Store<AppState>, useClass: StoreMock },
        { provide: ActivatedRoute, useValue: { queryParamMap: of() } },
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CartOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
