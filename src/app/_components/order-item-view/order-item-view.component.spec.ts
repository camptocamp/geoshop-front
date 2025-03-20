import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemViewComponent } from './order-item-view.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';


describe('OrderItemViewComponent', () => {
  let component: OrderItemViewComponent;
  let fixture: ComponentFixture<OrderItemViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderItemViewComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderItemViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
