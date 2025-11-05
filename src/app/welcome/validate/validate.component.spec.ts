import { Order, OrderItem } from "@app/models/IOrder";
import { ApiOrderService } from "@app/services/api-order.service";
import { AuthService } from "@app/services/auth.service";
import { ConfigService } from "@app/services/config.service";
import { MapService } from "@app/services/map.service";

import { CommonModule, LowerCasePipe } from '@angular/common';
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActivatedRoute, RouterLink, Params } from "@angular/router";
import { provideMockStore } from '@ngrx/store/testing';
import { StsConfigLoader } from "angular-auth-oidc-client";
import { BehaviorSubject, of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ValidateComponent } from "./validate.component";


class ConfigServiceMock {
  public config = {
    map: {
      projection: {
        initialExtent: [0, 0, 1, 1],
      }
    },
    pageformats: [{ name: "", height: 1, width: 1 }],
  }
}

class MockAuthService {
  public isAuthenticated = new BehaviorSubject<boolean>(true);
}

const fakeItem = {
  id: "item_id", product: { id: "id", label: "label" }, order_guid: "1234"
} as unknown as OrderItem;

const fakeOrder = {
  client: {
    company_name: "company",
  },
} as unknown as Order;

describe('ValidateComponent', () => {
  let fixture: ComponentFixture<ValidateComponent>;
  let params: Subject<Params>;
  let items: Subject<OrderItem | null>;
  let orders: Subject<Order | null>;

  beforeEach(() => {
    params = new BehaviorSubject<Params>({ token: "token" });
    orders = new Subject<Order>();
    items = new Subject<OrderItem>();
    TestBed.configureTestingModule({
      imports: [
        CommonModule, LowerCasePipe, MatButtonModule, MatCardModule, MatProgressSpinnerModule,
        RouterLink
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({}),
        StsConfigLoader,
        { provide: AuthService, useClass: MockAuthService },
        { provide: ActivatedRoute, useValue: { queryParamMap: of(), params: params } },
        {
          provide: ApiOrderService, useValue: {
            getOrderItemByToken: vi.fn().mockImplementation(() => items),
            getOrderByUUID: vi.fn().mockImplementation(() => orders),
          }
        },
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: MapService, useValue: { generateMiniMap: vi.fn() } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ValidateComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show spinner if request is in progress', () => {
    const el = fixture.nativeElement;
    expect(el.querySelector("mat-card-content mat-spinner")).toBeTruthy();
  });

  it('should show error message if no orderitem found', () => {
    const el = fixture.nativeElement;
    items.next(null);
    fixture.detectChanges();
    expect(el.querySelector("mat-card-content mat-spinner")).toBeFalsy();
    expect(el.querySelector("mini-map")).toBeFalsy();
    expect(el.querySelector("mat-card-content p").innerHTML).toContain("No order item with token");
  });

  it('should show error message if no order found', () => {
    const el = fixture.nativeElement;
    items.next(fakeItem);
    orders.next(null);
    fixture.detectChanges();
    expect(el.querySelector("mat-card-content mat-spinner")).toBeFalsy();
    expect(el.querySelector("mini-map")).toBeFalsy();
    expect(el.querySelector("mat-card-content p").innerHTML).toContain("No order with id 1234 found for item \"item_id: label\"");
  });

  it('should show information if there are both order and item', () => {
    const el = fixture.nativeElement;
    vi.mock('@app/helpers/geoHelper', () => {
      return {
        generateMiniMap: async () => ({ minimap: null, vectorSource: null }),
        displayMiniMap: () => ({})
      };
    });
    items.next(fakeItem);
    orders.next(fakeOrder);
    fixture.detectChanges();
    expect(el.querySelector("mat-card-content mat-spinner")).toBeFalsy();
    expect(el.querySelector("mat-card-content").innerHTML).toContain("Titre du mandat");
  });
});
