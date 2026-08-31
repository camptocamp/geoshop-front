/**
 * Which payment path applies to an order, as decided by the backend.
 *
 * - `card`  the price is fully auto-calculated: card payment may be offered alongside invoice
 * - `free`  the total is 0: no payment needed
 * - `quote` at least one item needs a manual quote: invoice / quote path only
 */
export type PaymentOption = 'card' | 'free' | 'quote';

/**
 * Result of a get on the api
 * ex: POST {apiUrl}/order/11710/prepare/
 *
 * Read-only on the backend: it computes the definitive final price and eligibility
 * without modifying the order, so it must never be written back to the cart store.
 */
export interface IPrepareResult {
  payment_option: PaymentOption;
  total: string;
  currency: string;
}

/**
 * Result of a get on the api
 * ex: POST {apiUrl}/order/11710/pay/
 *
 * `redirect_url` points to the provider's hosted payment page (external origin).
 */
export interface IPayResult {
  payment_required: boolean;
  redirect_url: string;
  payment_id: string;
  amount: string;
}
