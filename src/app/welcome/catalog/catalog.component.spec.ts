import { IApiResponse } from '@app/models/IApi';
import { IProduct } from '@app/models/IProduct';
import { ApiService } from '@app/services/api.service';
import { AppState } from '@app/store';

import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { CatalogComponent } from './catalog.component';



class StoreMock {
  select = vi.fn().mockImplementation(() => of(vi.fn()));
  dispatch = vi.fn();
}

class MockApiService {
  apiUrl = "";
  getProducts = () => {
    return of({
      count: 0, next: "", previous: "",
      results: [
        { id: 1, label: "Product 1" },
        { id: 2, label: "Product 2" },
        { id: 3, label: "PRODUCT 3" },
        { id: 4, label: "not a PROducT" }
      ]
    } as IApiResponse<IProduct>);
  }
}

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule, ReactiveFormsModule,
        CommonModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogModule
      ],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: Store<AppState>, useClass: StoreMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
