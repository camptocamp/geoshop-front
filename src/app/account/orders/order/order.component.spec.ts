import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderComponent } from './order.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/_store';
import { HttpClient, HttpHandler } from '@angular/common/http';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
}

describe('OrderComponent', () => {
  let component: OrderComponent;
  let fixture: ComponentFixture<OrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderComponent ],
      providers: [
        {provide: Store<AppState>, useClass: StoreMock},
        HttpClient,
        HttpHandler,
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
