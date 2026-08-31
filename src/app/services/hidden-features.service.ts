import { Injectable } from '@angular/core';

const CARD_PAYMENT_PARAM = 'cardPayment';
/** sessionStorage key */
const CARD_PAYMENT_STORAGE_KEY = 'geoshop_feature_card_payment';

/**
 * Hidden features, opted into through a query parameter.
 * 
 * The parameter is read in the first page load and kept in sessionStorage for the lifetime of the tab. 
 * It is not persisted across tabs or sessions, and it is not exposed in the UI. 
 *
 */
@Injectable({
  providedIn: 'root'
})
export class HiddenFeaturesService {

  private cardPaymentEnabled = false;

  constructor() {
    this.cardPaymentEnabled = this.readFromStorage();
  }

  public get isCardPaymentEnabled(): boolean {
    return this.cardPaymentEnabled;
  }

  /**
   * `?cardPayment`, `?cardPayment=1` and `?cardPayment=true` enable the feature;
   * `?cardPayment=0` and `?cardPayment=false` explicitly disable it again. When the parameter is
   * absent the previously value is kept.
   */
  public captureFromUrl(search: string = window.location.search): void {
    const params = new URLSearchParams(search);

    if (!params.has(CARD_PAYMENT_PARAM)) {
      this.cardPaymentEnabled = this.readFromStorage();
      return;
    }

    this.cardPaymentEnabled = HiddenFeaturesService.isEnablingValue(params.get(CARD_PAYMENT_PARAM));
    this.writeToStorage(this.cardPaymentEnabled);
  }

  /**
   * A bare `?cardPayment` yields an empty value and counts as enabling. Anything unrecognised
   * leaves the feature off — it gates payment, so it defaults to closed.
   */
  private static isEnablingValue(value: string | null): boolean {
    const normalized = (value ?? '').trim().toLowerCase();
    return normalized === '' || normalized === '1' || normalized === 'true';
  }

  private readFromStorage(): boolean {
    try {
      return sessionStorage.getItem(CARD_PAYMENT_STORAGE_KEY) === 'true';
    } catch {
      // sessionStorage can be unavailable (private mode, blocked storage). The feature stays off.
      return false;
    }
  }

  private writeToStorage(isEnabled: boolean): void {
    try {
      sessionStorage.setItem(CARD_PAYMENT_STORAGE_KEY, String(isEnabled));
    } catch {
      // Not fatal: the flag simply will not survive a reload.
    }
  }
}
