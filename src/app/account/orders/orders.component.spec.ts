import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersComponent } from './orders.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/_store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkScrollableModule, ScrollingModule } from '@angular/cdk/scrolling';
import { MatAccordion } from '@angular/material/expansion';
import { NoopAnimationDriver } from '@angular/animations/browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
  pipe =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
}

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
         MatFormFieldModule,
         MatButtonModule,
         MatInputModule,
         MatIcon,
         ReactiveFormsModule,
         MatProgressSpinnerModule,
         CdkScrollableModule,
         ScrollingModule,
         MatAccordion,
         NoopAnimationsModule,
         RouterModule.forRoot([]),
      ],
      declarations: [ OrdersComponent ],
      providers: [
        {provide: Store<AppState>, useClass: StoreMock},
        HttpClient,
        HttpHandler,
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
