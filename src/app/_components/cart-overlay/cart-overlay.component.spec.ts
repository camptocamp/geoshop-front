import { vi } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartOverlayComponent } from './cart-overlay.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../_store';
import { of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

class StoreMock {
  select =  vi.fn().mockImplementation(() => of(vi.fn()));
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
        {provide: Store<AppState>, useClass: StoreMock},
        { provide: ActivatedRoute, useValue: { queryParamMap: of() }},
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
