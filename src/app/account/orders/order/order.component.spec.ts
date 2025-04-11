import { vi } from 'vitest'
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderComponent } from './order.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../../_store';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';


class StoreMock {
  select =  vi.fn();
  dispatch = vi.fn();
}

describe('OrderComponent', () => {
  let component: OrderComponent;
  let fixture: ComponentFixture<OrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ OrderComponent ],
      providers: [
        {provide: Store<AppState>, useClass: StoreMock},
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
