import { TestBed } from '@angular/core/testing';

import { HiddenFeaturesService } from './hidden-features.service';


describe('HiddenFeaturesService', () => {
  let service: HiddenFeaturesService;

  const createService = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(HiddenFeaturesService);
  };

  beforeEach(() => {
    sessionStorage.clear();
    service = createService();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('is disabled when the parameter is absent', () => {
    service.captureFromUrl('?bounds=1,2,3,4');
    expect(service.isCardPaymentEnabled).toBe(false);
  });

  it('is enabled by a bare parameter', () => {
    service.captureFromUrl('?cardPayment');
    expect(service.isCardPaymentEnabled).toBe(true);
  });

  it('is enabled by =1 and =true, case-insensitively', () => {
    service.captureFromUrl('?cardPayment=1');
    expect(service.isCardPaymentEnabled).toBe(true);

    service.captureFromUrl('?cardPayment=TRUE');
    expect(service.isCardPaymentEnabled).toBe(true);
  });

  it('is disabled by =0 and =false', () => {
    service.captureFromUrl('?cardPayment=0');
    expect(service.isCardPaymentEnabled).toBe(false);

    service.captureFromUrl('?cardPayment=false');
    expect(service.isCardPaymentEnabled).toBe(false);
  });

  it('stays off for an unrecognised value', () => {
    service.captureFromUrl('?cardPayment=maybe');
    expect(service.isCardPaymentEnabled).toBe(false);
  });

  it('survives a reload once latched', () => {
    service.captureFromUrl('?cardPayment=1');

    // A reload: new instance, and the parameter is no longer in the URL.
    const reloaded = createService();
    reloaded.captureFromUrl('?bounds=1,2,3,4');

    expect(reloaded.isCardPaymentEnabled).toBe(true);
  });

  it('can be turned off again explicitly', () => {
    service.captureFromUrl('?cardPayment=1');

    const reloaded = createService();
    reloaded.captureFromUrl('?cardPayment=false');
    expect(reloaded.isCardPaymentEnabled).toBe(false);

    // And the disabled state is what a later navigation without the parameter keeps.
    const afterReload = createService();
    afterReload.captureFromUrl('');
    expect(afterReload.isCardPaymentEnabled).toBe(false);
  });

  it('does not leak into another tab (no stored value)', () => {
    service.captureFromUrl('?cardPayment=1');
    sessionStorage.clear(); // a fresh tab starts with empty sessionStorage

    const otherTab = createService();
    otherTab.captureFromUrl('');
    expect(otherTab.isCardPaymentEnabled).toBe(false);
  });
});
