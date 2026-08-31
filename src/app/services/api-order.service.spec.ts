import { IPayResult, IPrepareResult } from '@app/models/IPayment';
import { ConfigService } from '@app/services/config.service';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApiOrderService } from './api-order.service';


const API_URL = 'https://example.com/api';

describe('ApiOrderService', () => {
  let service: ApiOrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiOrderService);
    httpMock = TestBed.inject(HttpTestingController);
    // The service reads the api url lazily from the config, which is normally loaded at bootstrap.
    TestBed.inject(ConfigService).config = { apiUrl: API_URL } as never;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('prepareOrder', () => {
    it('posts to /order/{id}/prepare/ and returns the result', () => {
      const expected: IPrepareResult = { payment_option: 'card', total: '42.00', currency: 'CHF' };
      let actual: IPrepareResult | undefined;

      service.prepareOrder(11710).subscribe(result => actual = result);

      const req = httpMock.expectOne(`${API_URL}/order/11710/prepare/`);
      expect(req.request.method).toBe('POST');
      req.flush(expected);

      expect(actual).toEqual(expected);
    });

    it('propagates errors instead of swallowing them into null', () => {
      let errored = false;
      let nexted = false;

      service.prepareOrder(11710).subscribe({
        next: () => nexted = true,
        error: () => errored = true,
      });

      httpMock.expectOne(`${API_URL}/order/11710/prepare/`)
        .flush({ detail: 'boom' }, { status: 500, statusText: 'Server Error' });

      expect(errored).toBe(true);
      expect(nexted).toBe(false);
    });
  });

  describe('payOrder', () => {
    it('posts to /order/{id}/pay/ and returns the redirect url', () => {
      const expected: IPayResult = {
        payment_required: true,
        redirect_url: 'https://checkout.postfinance.ch/s/1234',
        payment_id: 'abc-123',
        amount: '42.00',
      };
      let actual: IPayResult | undefined;

      service.payOrder(11710).subscribe(result => actual = result);

      const req = httpMock.expectOne(`${API_URL}/order/11710/pay/`);
      expect(req.request.method).toBe('POST');
      req.flush(expected);

      expect(actual).toEqual(expected);
    });

    it('propagates errors instead of swallowing them into null', () => {
      let errored = false;
      let nexted = false;

      service.payOrder(11710).subscribe({
        next: () => nexted = true,
        error: () => errored = true,
      });

      httpMock.expectOne(`${API_URL}/order/11710/pay/`)
        .flush({ detail: 'boom' }, { status: 502, statusText: 'Bad Gateway' });

      expect(errored).toBe(true);
      expect(nexted).toBe(false);
    });
  });
});
