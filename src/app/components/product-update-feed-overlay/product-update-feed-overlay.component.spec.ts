import { IFeed } from '@app/models/IFeed';
import { ApiService } from '@app/services/api.service';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductUpdateFeedOverlayComponent } from './product-update-feed-overlay.component';

const mockFeeds: IFeed[] = [
  { name: 'Product 1', url: 'https://test.com/feeds/product/1' },
  { name: 'Product 2', url: 'https://test.com/feeds/product/2' },
];

class MockApiService {
  getProductUpdateFeeds = vi.fn().mockReturnValue(of(mockFeeds));
}

describe('ProductUpdateFeedOverlayComponent', () => {
  let component: ProductUpdateFeedOverlayComponent;
  let fixture: ComponentFixture<ProductUpdateFeedOverlayComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductUpdateFeedOverlayComponent],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    apiService = TestBed.inject(ApiService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductUpdateFeedOverlayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load product update feeds on init', () => {
    fixture.detectChanges();

    expect(apiService.getProductUpdateFeeds).toHaveBeenCalled();
    expect(component.allFeeds.getValue()).toEqual(mockFeeds);
  });

  it('should render the feeds list in the template', () => {
    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.css('a[mat-menu-item]'));
    expect(links.length).toBe(mockFeeds.length);

    expect(links[0].nativeElement.textContent.trim()).toBe('Product 1');
    expect(links[0].nativeElement.getAttribute('href')).toBe('https://test.com/feeds/product/1');
    expect(links[0].nativeElement.getAttribute('target')).toBe('_blank');

    expect(links[1].nativeElement.textContent.trim()).toBe('Product 2');
    expect(links[1].nativeElement.getAttribute('href')).toBe('https://test.com/feeds/product/2');
    expect(links[1].nativeElement.getAttribute('target')).toBe('_blank');
  });

  it('should handle empty feed list', () => {
    vi.spyOn(apiService, 'getProductUpdateFeeds').mockReturnValue(of([]));

    fixture.detectChanges();

    expect(component.allFeeds.getValue()).toEqual([]);
    const links = fixture.debugElement.queryAll(By.css('a[mat-menu-item]'));
    expect(links.length).toBe(0);
  });
});
