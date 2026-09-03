/** How the buyer settles a confirmed order. */
export type PaymentMethod = 'card' | 'invoice';

/**
 * State of a card payment attempt, mirroring the provider's transaction state.
 *
 * - `CREATED` / `PENDING` — a hosted-page session is open. Starting a payment again *resumes* it
 *   rather than charging twice, so the buyer may still be offered the card button.
 * - `AUTHORIZED` — funds are held but not captured. The backend refuses a second charge with a
 *   409, so the card button must not be offered.
 * - `SETTLED` — captured. The only state that means "paid".
 * - `FAILED` / `CANCELED` — terminal; the buyer may try again.
 */
export type PaymentStatus =
  'CREATED' | 'PENDING' | 'AUTHORIZED' | 'SETTLED' | 'FAILED' | 'CANCELED';

/** Statuses where the money is committed and a second payment must not be started. */
export const COMMITTED_PAYMENT_STATUSES: PaymentStatus[] = ['AUTHORIZED', 'SETTLED'];

/**
 * Result of a post on the api
 * ex: POST {apiUrl}/order/11710/pay/
 *
 * `redirect_url` points to the provider's hosted payment page (an external origin).
 */
export interface IPayResult {
  redirect_url: string;
  payment_id: number;
  amount: string;
}
