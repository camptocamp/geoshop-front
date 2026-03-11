import { ConfigService } from '@app/services/config.service';
import { AppState } from '@app/store';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { AsyncPipe, CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { OrderComponent } from './order/order.component';
import { OrdersComponent } from './orders.component';



class StoreMock {
  select = vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
  pipe = vi.fn().mockImplementation(() => of(vi.fn()));
}

class ConfigServiceMock {
  public config = {
    map: {
      basemaps: [vi.fn()],
      projection: {
        initialExtent: [0, 0, 1, 1],
      }
    },
    pageformats: [{ name: "", height: 1, width: 1 }],
    apiUrl: "http://some/api/url"
  }
}

describe('OrdersComponent', () => {
  global.ResizeObserver = global.ResizeObserver || vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));

  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatProgressSpinnerModule, OrderComponent, MatAccordion, ScrollingModule, MatIconModule,
        FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, AsyncPipe,
        CommonModule, MatButtonModule,
        NoopAnimationsModule,
        OrdersComponent, OrderComponent,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: of() } },
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: Store<AppState>, useClass: StoreMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display order', () => {
    httpTesting.match(() => true)[0].flush({
      results: [{ url: "http://orders/1", order_status: "DRAFT", items: [] }],
    });
    fixture.detectChanges();

    const panelDebugElement = fixture.debugElement.query(By.directive(MatExpansionPanel));
    const panelInstance = panelDebugElement.componentInstance as MatExpansionPanel;

    panelInstance.open();
    fixture.detectChanges();
    expect(panelInstance.expanded).toBeTruthy();

    const panelBody = fixture.debugElement.query(By.css('.mat-expansion-panel-content'));
    expect(panelBody.styles['visibility']).not.toBe('hidden');

    httpTesting.match(() => true)[0].flush({
      url: "http://some/api/url/orders/1", order_status: "DRAFT", items: []
    });
    fixture.detectChanges();
  });
});
