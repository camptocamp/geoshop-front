import { TestBed } from '@angular/core/testing';

import { ApiOrderService } from './api-order.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';


describe('ApiOrderService', () => {
  let service: ApiOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
