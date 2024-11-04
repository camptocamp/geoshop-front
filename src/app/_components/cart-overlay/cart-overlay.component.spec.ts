import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartOverlayComponent } from './cart-overlay.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/_store';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
}

describe('CartOverlayComponent', () => {
  let component: CartOverlayComponent;
  let fixture: ComponentFixture<CartOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ CartOverlayComponent ],
      imports: [
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
      ],
      providers: [
        {provide: Store<AppState>, useClass: StoreMock},
        HttpClient,
        HttpHandler
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
