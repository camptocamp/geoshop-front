import { vi } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersComponent } from './orders.component';

import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../_store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkScrollableModule, ScrollingModule } from '@angular/cdk/scrolling';
import { MatAccordion } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigService } from '../../_services/config.service';

class StoreMock {
  select = vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
  pipe = vi.fn().mockImplementation(() => of(vi.fn()));
}

class ConfigServiceMock {
  public config = {
    basemaps: [vi.fn()],
    initialExtent: [0, 0, 1, 1],
    pageformats: [{ name: "", height: 1, width: 1 }],
  }
}

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
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
      declarations: [OrdersComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: of() }},
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: Store<AppState>, useClass: StoreMock },
        provideHttpClient(),
        provideHttpClientTesting()
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
