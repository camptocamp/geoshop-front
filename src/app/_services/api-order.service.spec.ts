import { TestBed } from '@angular/core/testing';

import { ApiOrderService } from './api-order.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('ApiOrderService', () => {
  let service: ApiOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler
      ],
    });
    service = TestBed.inject(ApiOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
