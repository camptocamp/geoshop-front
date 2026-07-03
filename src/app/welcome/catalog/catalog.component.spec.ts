import { IApiResponse } from '@app/models/IApi';
import { IProduct } from '@app/models/IProduct';
import { ApiService } from '@app/services/api.service';
import { AppState } from '@app/store';

import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogComponent } from './catalog.component';


const fakeProductList: IProduct[] = [
  { id: 1, label: "Product 1 filter" },
  { id: 2, label: "Product 2 another" },
  { id: 3, label: "PRODUCT 3 extra" },
  { id: 4, label: "just something" }
];

class StoreMock {
  select = vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
}

class MockApiService {
  apiUrl = "";
  getProducts = () => {
    return of({
      count: fakeProductList.length,
      next: "",
      previous: "",
      results: fakeProductList
    } as IApiResponse<IProduct>);
  };
  // Fake filter that imitates backend filtering
  find = (query: string) => {
    const filtered = fakeProductList.filter(p => p.label.toLowerCase().includes(query.toLowerCase()));
    return of({
      count: filtered.length, next: "", previous: "",
      results: filtered
    } as IApiResponse<IProduct>);
  }
}

describe('CatalogComponent', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule, ReactiveFormsModule,
        CommonModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogModule
      ],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: Store<AppState>, useClass: StoreMock },
        {provide: ComponentFixtureAutoDetect, useValue: true},
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();
  });

  function getVisibleProducts(fixture: ComponentFixture<CatalogComponent>): string[] {
    fixture.detectChanges();
    return [
      ...fixture.nativeElement.querySelectorAll(".item-label")
    ].map((e: HTMLElement) => e.textContent?.trim() || '');
  }

  it('should create', () => {
    expect(TestBed.createComponent(CatalogComponent)).toBeTruthy();
  });

  it('should show all products by default', () => {
    const fixture = TestBed.createComponent(CatalogComponent);
    expect(getVisibleProducts(fixture)).toEqual([
      "Product 1 filter", "Product 2 another", "PRODUCT 3 extra", "just something"
    ]);
  });

  it('should filter products based on search query', () => {
    const fixture = TestBed.createComponent(CatalogComponent);

    fixture.componentInstance.productFilter.setValue("something");
    expect(getVisibleProducts(fixture)).toEqual(["just something"]);

    fixture.componentInstance.productFilter.setValue("product");
    expect(getVisibleProducts(fixture)).toEqual([
      "Product 1 filter", "Product 2 another", "PRODUCT 3 extra"
    ]);
  });

  it('should apply filter only after minimal length', async () => {
    const fixture = TestBed.createComponent(CatalogComponent);

    fixture.componentInstance.productFilter.setValue("pr");
    expect(getVisibleProducts(fixture)).toEqual([
      "Product 1 filter", "Product 2 another", "PRODUCT 3 extra", "just something"
    ]);

    fixture.componentInstance.productFilter.setValue("pro");
    expect(getVisibleProducts(fixture)).toEqual([
      "Product 1 filter", "Product 2 another", "PRODUCT 3 extra"
    ]);

    fixture.componentInstance.productFilter.setValue("pr");
    expect(getVisibleProducts(fixture)).toEqual([
      "Product 1 filter", "Product 2 another", "PRODUCT 3 extra", "just something"
    ]);
  });
});
