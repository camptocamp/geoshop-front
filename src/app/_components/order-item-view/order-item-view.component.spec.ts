import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemViewComponent } from './order-item-view.component';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('OrderItemViewComponent', () => {
  let component: OrderItemViewComponent;
  let fixture: ComponentFixture<OrderItemViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderItemViewComponent ],
      providers: [
        HttpClient,
        HttpHandler,
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
