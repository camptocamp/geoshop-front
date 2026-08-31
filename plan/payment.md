# Frontend plan — card payment (PostFinance Checkout)

Companion to `../geoshop-back/docs/payment.md`. Frontend only; no code written yet.

## Goal

1. Hidden feature, enabled only by a `cardPayment` URL parameter.
2. At checkout, push the latest order state, then call `POST /order/{id}/prepare/` to get the
   definitive price and eligibility.
3. If eligible **and** the flag is on, offer **card** or **invoice**.
4. On card, `POST /order/{id}/pay/` returns `redirect_url` → redirect the buyer to PostFinance.

## What the backend gives us

| Endpoint | Method | Returns |
|---|---|---|
| `/order/{id}/prepare/` | POST | `{ payment_option: "card" \| "free" \| "quote", total, currency }` — read-only, does not mutate the cart |
| `/order/{id}/pay/` | POST | `{ payment_required, redirect_url, payment_id, amount }` |
| `/order/{id}/confirm/` | GET | unchanged invoice path |

New order statuses: `AWAITING_PAYMENT`, `PAYMENT_FAILED`.

**`prepare` being read-only is the key simplification.** Group expansion is previewed in memory and
persisted only on commit, so expanded child items never reach the frontend. The cart slice keeps
holding user-chosen groups, and the localStorage persistence in
[storage.reducer.ts](../src/app/store/storage.reducer.ts) needs no change. The one rule this imposes
on us: **never feed the `prepare` response through `StoreService.addOrderToStore`** — it would write
into the persisted `cart` slice. Keep it in component state.

---

## Phase 1 — Models and constants

**[src/app/models/IOrder.ts](../src/app/models/IOrder.ts)**
- Add `'AWAITING_PAYMENT' | 'PAYMENT_FAILED'` to the `OrderStatus` union (line 22-31).
- Add two `case` branches to `Order.initializeStatus` (line 300+). Without them both statuses fall
  through to `default` and render as "Etat inconnu" in the orders list.
  - `AWAITING_PAYMENT` → icon `hourglass_empty`, colour `#7593f0`
  - `PAYMENT_FAILED` → icon `error_outline`, colour `#000000`

**[src/app/constants.ts](../src/app/constants.ts)** — add to `ORDER_STATUS` (line 17-29), using the
existing `$localize`/`@@order.*` id convention:
- `AWAITING_PAYMENT: $localize`:@@order.awaiting_payment:En attente du paiement``
- `PAYMENT_FAILED: $localize`:@@order.payment_failed:Paiement échoué``

**New — `src/app/models/IPayment.ts`**
```ts
export type PaymentOption = 'card' | 'free' | 'quote';

export interface IPrepareResult {
  payment_option: PaymentOption;
  total: string;
  currency: string;
}

export interface IPayResult {
  payment_required: boolean;
  redirect_url: string;
  payment_id: string;
  amount: string;
}
```

---

## Phase 2 — Hidden Feature Service (`?cardPayment`)

The opt in must survive several navigations that currently drop query params. Two confirmed losses:

- `naviguateToNewOrder()` at
  [cart-overlay.component.ts:135-145](../src/app/components/cart-overlay/cart-overlay.component.ts#L135-L145)
  navigates with `queryParams: { callback }` and **no** `queryParamsHandling: 'merge'` → the param is
  dropped on the cart → checkout hop, which is exactly where we need it.
- The post-login redirect `this.router.navigate([payload.callbackUrl || '/'])` in
  [auth.effects.ts](../src/app/store/auth/auth.effects.ts) also drops it, and the OIDC round-trip
  leaves the app entirely.

The map does merge (`queryParamsHandling: 'merge'`,
[map.component.ts:88-92](../src/app/welcome/map/map.component.ts#L88-L92)), so it only survives while
the user stays on the map.

**Approach — latch the flag once, don't chase query params.**

New `src/app/services/hidden-features.service.ts` (`HiddenFeaturesService`):
- On construction, read `cardPayment` from `window.location.search`.
- If present, latch to `true` and mirror into `sessionStorage`; otherwise read back from
  `sessionStorage`. There's precedent for this — `auth.service.ts:56` already uses `sessionStorage`
  for `oidc_redirect`.
- Expose `get isCardPaymentEnabled(): boolean`.

Why `sessionStorage` and not the ngrx store: the persisted slices are `['cart', 'auth', 'map']` in
`localStorage`, so a flag there would stick permanently across sessions. `sessionStorage` gives
tab-scoped opt-in that survives reload and the OIDC redirect, and clears when the tab closes.

Accept any of `?cardPayment`, `?cardPayment=1`, `?cardPayment=true`; treat `=false`/`=0` as off so
it can be explicitly cleared.

---

## Phase 3 — API service

**[src/app/services/api-order.service.ts](../src/app/services/api-order.service.ts)** — add two
methods following the existing `_getApiUrl()` + `new URL(...)` idiom:

```
prepareOrder(orderId: number): Observable<IPrepareResult>   // POST /order/{id}/prepare/
payOrder(orderId: number):     Observable<IPayResult>       // POST /order/{id}/pay/
```

**Deliberate departure from the file's convention:** every other method swallows failures into
`of(null)` / `of(false)`. Do **not** do that here. A silent `null` on `prepare` is
indistinguishable from "not eligible", and a silent failure on `pay` leaves the buyer staring at a
dead button. Let the error propagate.

The component does **not** need to show its own message: the global
[errorInterceptor](../src/app/interceptors/errorInterceptor.ts) already opens an error snackbar for
every failed request and re-throws. The component only has to reset `isPreparing` / `isPaying` and
re-enable the button — adding a second snackbar would double up.

*Status: done.* Both methods send an empty JSON body `{}` so the request carries a
`Content-Type: application/json` header rather than being a bodyless POST.

---

## Phase 4 — Checkout flow in `NewOrderComponent`

### 4.0 Constraints `prepare` imposes (`../geoshop-back/api/views.py:455-486`)

Rejected unless: `order_status == DRAFT` (403), at least one item (400), and **every item has a
`data_format`** (400). So `prepare` cannot run when the user enters the preview step — a fresh order
arrives with no formats (`toPostAsJson` drops empty ones,
[IOrder.ts:220-222](../src/app/models/IOrder.ts#L220-L222)) and the call would just 400.

`set_price` (`api/models.py:1235-1283`) reads `order_type`, `invoice_contact.subscribed`,
`order.geom` and the item's `data_format`. `order_type` in `("Communal", "Cantonal", "Fédéral",
"Académique")` zeroes the price outright, so a stale read can flip `payment_option` between `free`,
`card` and `quote` — not just shift a number.

### 4.1 Ordering: trigger from the save's callback

Steps 1-2 "Suivant" carry both `matStepperNext` (advances instantly) and
`(click)="createOrUpdateDraft()"` (fires `POST`/`PUT` and returns at once) — unordered. Since 4.0
shows steps 1-2 feed pricing, `prepare` must never run before that write lands.

Fix without touching the buttons: trigger the refresh **inside the existing subscribe callback**, so
ordering holds by construction.

```ts
this.createOrUpdateOrder().subscribe(newOrder => {
  this.storeService.addOrderToStore(new Order(newOrder as IOrder));
  if (this.isEnteringPreviewStep) this.refreshPreparedCheckout();   // the write has landed
})
```

A failed write never emits (`filter(newOrder => !!newOrder)`), so nothing prepares against unsaved
state and the interceptor still shows the error.

Detect the transition by identity, not index — step 2 is `*ngIf`'d on `billingRequired()`:

```ts
@ViewChild('previewStep') previewStep: MatStep;

private get isEnteringPreviewStep(): boolean {
  const steps = this.stepper.steps.toArray();       // public in Material 19.2
  return steps[this.stepper.selectedIndex + 1] === this.previewStep;
}
```

A positional test (`selectedIndex === steps.length - 2`) works today but silently stops matching if a
step is added, silently disabling card payment. Only read this from a click handler — the stepper is
behind `*ngIf="currentOrder"`.

### 4.2 State to hold

```
prepareResult: IPrepareResult | null   // component state only — never addOrderToStore
isPreparing: boolean
selectedPaymentMethod: 'card' | 'invoice' | null
isPaying: boolean
```

### 4.3 `refreshPreparedCheckout()` — one guarded routine

```
prepareResult = null; selectedPaymentMethod = null   // invalidate first
if (orderItemFormGroup.invalid) return               // a format is missing: prepare would 400
if (currentOrder.id <= 0) return                     // create failed: would PATCH /order/-1/
isPreparing = true
updateOrderItemsDataFormats(order)                   // persist formats
  -> addOrderToStore(freshOrder)
  -> prepareOrder(order.id)
  -> prepareResult = result
```

**The guard is the existing invoice precondition reused** — `orderItemFormGroup.invalid` already
disables the confirm button and is the same condition the backend enforces. No new validation.

**Triggers:** the save callback in 4.1, and any format change (per-row or apply-to-all), debounced
with `switchMap`.

**Call volume is low:** the form only becomes valid on the *last* format chosen, so a normal
monotonic fill costs exactly one `PATCH` + one `prepare`, not one per item.

**Persistence side effect:** per-row picks currently reach the server only at `confirm()`
(`updateDataFormat` is local-only). This moves them into the draft — but only once *every* item has a
format, so an abandoned partial selection still saves nothing. (Apply-to-all already persists
partial sets; left alone.)

**PUT-before-PATCH is load-bearing.** `PUT` deletes items absent from the payload
(`serializers.py:429-436`); `PATCH` does not. So a PATCH against an order left expanded by a
previous `/pay` would price `A + B + G`. Safe here only because the PATCH is triggered from the
PUT's callback — do not move the trigger.

**Invalidate immediately, not eventually.** Clear first, recompute after; during the gap there is no
payment choice on screen. Triggers: either format path, step 1-2 edits (4.6), any store update.

### 4.4 `prepareResult` is an enhancement, never a precondition

Whatever reads `prepareResult.payment_option` must fall back to today's `price_status` label
([new-order.component.ts:95-99](../src/app/account/new-order/new-order.component.ts#L95-L99)) and
the plain invoice confirm when it is `null` — not computed yet, or the call failed. Otherwise a
failing `prepare` would leave the buyer unable to order at all.

**Deferred to Phase 5: `buttonConfirmLabel` is left untouched.** A `payment_option`-driven branch was
written and removed — it produced the same label as the fallback in every card/free case, so it was
inert code that merely looked meaningful. The two predicates do diverge, and exactly where the
feature matters: `prepare_checkout()` returns `QUOTE` when `any(item.base_fee is None)` over the
**previewed expanded** items, while the fallback tests `price_status` on the **unexpanded** cart. A
group whose child exceeds `max_price` is `quote` to the backend and "Acheter maintenant" to the
fallback. That only becomes visible once the UI branches on `payment_option`.

The blocking question is UX, not code: "Acheter maintenant" currently confirms the order outright,
which is wrong once card is an option — it has to open the payment choice or be replaced by it.
Settle that with 4.5 before Phase 5.

Consequence: **Phase 4 has no user-visible effect.** `prepareResult` is written and never read. For a
hidden feature that is the intended end state of a plumbing phase.

Keep `Order.isAllOrderItemCalculated` as-is (still used for display in
[order-item-view.component.html](../src/app/components/order-item-view/order-item-view.component.html));
never use it to decide anything about payment.

### 4.5 Footer total discrepancy — open decision

The footer shows `order.total_with_vat` from the store, priced on the **unexpanded** cart;
`prepare` prices the **expanded** groups. For an order with a group these differ, so the buyer would
see two totals. Preferred: show `prepareResult.total` in the footer once available. Must not ship as
two unexplained numbers.

### 4.6 Stepper header jump — guard at `/pay`, not in the forms

Once steps 1-2 have valid forms and have been visited, every later step is reachable by header click
forever (`_anyControlsInvalidOrPending` only inspects *preceding* steps). So a user can change
Privé → Public on step 1 and jump straight to step 3 without any save, leaving `prepareResult`
describing the pre-edit order.

**Rejected:** watching `orderFormGroup.valueChanges` / `contactFormGroup.valueChanges` and clearing
`prepareResult`. `updateForms()` writes server values back into those same forms on *every* store
update, and `patchValue` fires `valueChanges` synchronously — indistinguishable from a user edit. It
needs a re-entrancy flag to avoid wiping the price during normal use (a cart-overlay removal, the
apply-to-all PATCH, or the refresh's own `addOrderToStore`), and `{emitEvent: false}` is not an
option because [order-form.model.ts:47-55](../src/app/account/new-order/order-form.model.ts#L47-L55)
depends on those events for the `description` validator. Too much machinery for the risk.

**Instead — check the amount at the only moment money is at stake.** `/pay` recomputes server-side
and returns `amount`, so compare it against the displayed `prepareResult.total` before redirecting
(Phase 6). A stale price is caught there, whatever caused it, without watching forms at all. And a
stale display can never produce a wrong charge, since the frontend never sends an amount.

> Pre-existing bug, own ticket: `updateOrder()` (the private one at
> [new-order.component.ts:202](../src/app/account/new-order/new-order.component.ts#L202)) is called
> only from `createOrUpdateDraft()` and `confirm()`. Via a header jump the user sees prices for the
> old `order_type`, then `confirm()` PUTs the new one and the backend reprices — they confirm at a
> price they never saw. Affects the invoice flow today.

### 4.7 Landing back on step 3 after a payment attempt

Return URL (to be set backend-side): `{base}/account/new-order?payment=success|failed|canceled&order={id}`
— pointing at the checkout rather than the app root keeps the handler in `NewOrderComponent`.

It is a full page load, so the stepper resets to step 0 and the forms repopulate from the
localStorage cart. Sequence on arrival:

```
PUT (replaces the items /pay expanded — mandatory, see 4.3)
  -> mark preceding steps completed, jump to step 3
  -> refreshPreparedCheckout()
```

`stepper.selectedIndex = 2` alone is **silently ignored**: Material's setter only applies the value
when `_anyControlsInvalidOrPending(index)` is false, and on a fresh load no step has
`interacted = true`. So mark them first:

```ts
this.orderTypeStep.completed = true;                        // public setter
if (this.contactStep) this.contactStep.completed = true;     // absent when billing isn't required
this.stepper.selectedIndex = 2;
```

Runs in the PUT's success callback, which is also after `currentOrder` exists — required, since the
stepper is behind `*ngIf="currentOrder"`.

Until the backend's `PAYMENT_FAILED → DRAFT` transition lands, `prepare` 403s here and the buyer
gets step 3 with invoice only. Fails closed, so shipping in this order is safe.


## Phase 5 — Payment choice UI — **done**

**Placement: inline in step 3, directly above the confirm button.** The final total already renders in
the price table footer
([data-format-step.component.html:60-65](../src/app/account/new-order/steps/data-format-step/data-format-step.component.html#L60-L65)),
so the choice belongs next to it. A fourth step would also mean juggling indices in a `linear`
stepper whose step 2 is already conditional.

*Built inline in [new-order.component.html:50-58](../src/app/account/new-order/new-order.component.html#L50-L58)
rather than as a separate `payment-step/` component: it is one radio group whose every input and
output already lives in the parent, so extracting it would have added `@Input`/`@Output` plumbing
and separated the radio from the button it controls.*

Gate — `isCardPaymentAvailable`
([new-order.component.ts:134-137](../src/app/account/new-order/new-order.component.ts#L134-L137)):
`hiddenFeatures.isCardPaymentEnabled && prepareResult?.payment_option === 'card'`. Checked in three
places, so a free / quote / not-yet-prepared order can never reach the card path:

1. `*ngIf` on the radio group — nothing rendered;
2. `buttonConfirmLabel` — stays *Acheter maintenant*;
3. `confirm()` — re-checks before dispatching, so a stale `selectedPaymentMethod` cannot leak
   through.

`selectedPaymentMethod` defaults to `'invoice'`, preserving today's one-click behaviour, and resets
to `'invoice'` whenever `prepareResult` is discarded — the choice belonged to the price that was
just thrown away.

Branching:

| `payment_option` | flag on | flag off |
|---|---|---|
| `card` | `mat-radio-group`: **Payer par carte** / **Payer sur facture**; button label follows the choice | current behaviour — *Acheter maintenant* → `confirm()` |
| `free` | no payment UI; *Acheter maintenant* → `confirm()` | same |
| `quote` | no payment UI; *Demander un devis* → `confirm()` | same |

With the flag off, nothing changes anywhere. That is the acceptance criterion for the hidden-feature
requirement.

Show `prepareResult.total` + `currency` next to the radio group as the amount to be charged, so the
figure the buyer confirms is literally the one from `prepare`.

---

## Phase 6 — Triggering the payment — **done**

Implemented as `payByCard()`, which `confirm()` delegates to when card is selected. On confirm with
`selectedPaymentMethod === 'card'`:

1. Set `isPaying = true`; the button is disabled on
   `orderItemFormGroup.invalid || isPreparing || isPaying` (single-submit guard).
2. `PUT` the order (persists any last edits), then `payOrder(order.id)`.
3. If `payment_required === false` → clear the cart and route to `/account/orders`. **Do not call
   `confirm()`.** See below.
4. **Compare `result.amount` with the displayed `prepareResult.total`.** If they differ the price
   moved since `prepare` — do not redirect. Re-prepare and tell the buyer to check the new total.
   This is the single guard against a stale displayed price (see 4.6), so it is not optional.
5. Otherwise `window.location.assign(result.redirect_url)` — an external origin, so **not**
   `router.navigate`.

> **Do not "fix" step 3 into a `confirm()` call.** An earlier draft of this plan said to fall through
> to the invoice path. That is wrong: `/pay` already confirms free orders itself
> (`views.py:437-440` — `order.confirm(); order.save(); return {'payment_required': False}`), and
> `confirm` rejects anything not in `DRAFT`/`QUOTE_DONE`, so a second call would 403 on an
> already-confirmed order.
>
> This branch is also **not** dead code, even though the card option never appears for an order that
> is free at prepare time (`prepare_checkout` returns `FREE`, and the Phase 5 gate requires `card`).
> It is reachable when an order *becomes* free after being prepared: prepare returns `card`, the user
> jumps to step 1 by header, switches the order type to Communal/Cantonal/Fédéral/Académique — which
> zeroes the price in `set_price` — and returns to step 3 with a stale `prepareResult`. `/pay` then
> reprices to zero. This is precisely the stale-price case 4.6 chose to catch here rather than by
> watching the step 1-2 forms.

**Do not clear the cart before redirecting.** `confirm()` currently dispatches
`fromCart.deleteOrder()` on success
([new-order.component.ts:243](../src/app/account/new-order/new-order.component.ts#L243)). On the
card path the payment can still fail or be abandoned, and the buyer needs their cart intact to
retry. Clear it only once settlement is confirmed (Phase 7).

On error: reset `isPaying` only. The global error interceptor already shows the message, and
`prepareResult` is left intact so the buyer can retry or switch to invoice.

---

## Phase 7 — Return from PostFinance

**No new route.** `_payment_return_urls` (`api/views.py:250-262`) currently builds
`{FRONT_URL}?payment=success|failed|canceled&order={id}` — the app root. That is a placeholder; it
will be repointed at `{base}/account/new-order?...` so the handler lives in `NewOrderComponent`
(see 4.7) instead of something always-loaded on the map page.

Settlement arrives by **async webhook**, so returning does **not** mean paid — the order may still be
`AWAITING_PAYMENT` on arrival.

- `payment=success` → poll `GET /order/{id}/` (≈2 s, capped ≈30 s).
  - `READY` or later → success message, `fromCart.deleteOrder()`, route to `/account/orders`.
  - still `AWAITING_PAYMENT` at timeout → neutral "paiement en cours de confirmation, vous recevrez
    un courriel" + link to `/account/orders`. Never assert success from the redirect alone.
- `payment=failed` / `canceled` → keep the cart, run the 4.7 landing sequence so the buyer resumes on
  step 3.

Blocked on the backend: nothing moves an order out of `PAYMENT_FAILED`, and `prepare`/`pay` both
require `DRAFT`, so a declined buyer currently gets 403 on retry. On the backend TODO list.

---

## Phase 8 — Orders list

[order.component.html](../src/app/account/orders/order/order.component.html) keys its actions off
`order_status`, so both new statuses need a decision:

- `AWAITING_PAYMENT` — hide Delete (line 22 currently shows it for `DRAFT`, which this is not, so
  it's already hidden; verify). Show the status chip from `initializeStatus`.
- `PAYMENT_FAILED` — show a retry affordance (back to cart / checkout). `pushBackToCart()` is gated
  on `DRAFT` (line 49) so it won't appear; decide whether to extend that condition or add a distinct
  button.

---

## Phase 9 — Tests

Specs already exist for the touched components. Add:

- `hidden-features.service` — param present/absent/`=false`, sessionStorage round-trip.
- `api-order.service` — `prepare` and `pay` URLs and payloads; error propagation (not swallowed).
- `new-order.component` — all three `payment_option` branches × flag on/off; PUT-then-prepare
  ordering; `prepareResult` invalidated on format change; cart **not** cleared before redirect.
- `payment-step.component` — radio rendering and emitted method.

---

## Out of scope / noted

- **`confirm()` is a mutating `GET`**
  ([api-order.service.ts:227-244](../src/app/services/api-order.service.ts#L227-L244)) and the
  backend doc keeps it that way. Not touched here, but it is prefetchable and retryable by browsers
  and proxies — worth revisiting on the backend side.
- **`hasPendingItem` is misnamed** — it returns `isAllOrderItemCalculated`, i.e. `true` when nothing
  is pending
  ([data-format-step.component.ts:51](../src/app/account/new-order/steps/data-format-step/data-format-step.component.ts#L51)).
  Rename while editing that file to avoid a misread next to the new payment gate.
- **Refunds** — backend stub only; no frontend surface.

## Order of work

1. ~~Phase 1 (models/constants) and Phase 2 (hidden feature service)~~ — **done**, no UI impact.
   Also added the `de` / `en` translations, which the plan had missed.
2. ~~Phase 3 (API service)~~ — **done**.
3. ~~Phase 4 (sequencing + state)~~ — **done**, minus 4.5 and 4.7. Note 4.6 was implemented as the
   `/pay` amount check rather than by watching the forms.
4. ~~Phase 5 + 6 (UI + redirect)~~ — **done**. The outgoing half of card payment works; the return
   leg does not exist yet.
5. **4.5 — still open and now the blocker for polish:** the footer shows the store's
   `total_with_vat` (unexpanded cart) while the radio shows `prepareResult.total` (expanded groups).
   For an order containing a group these are two different numbers on one screen.
6. Phase 7 — needs the return URL repointed and the `PAYMENT_FAILED → DRAFT` transition (both
   backend TODOs). Everything shipped so far is safe without them: `prepare` 403s and the flow
   degrades to invoice-only.
7. Phase 8 + 9. **Nothing in Phases 4-6 has test coverage yet** — no specs for the guard, the
   debounced pipeline, `isCardPaymentAvailable`, or the amount-mismatch branch.
