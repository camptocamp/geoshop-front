import { IOrder } from '@app/models/IOrder';
import { COMMITTED_PAYMENT_STATUSES, PaymentStatus } from '@app/models/IPayment';
import { ApiOrderService } from '@app/services/api-order.service';
import { HiddenFeaturesService } from '@app/services/hidden-features.service';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostBinding, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

export type PaymentOutcome = 'success' | 'failed' | 'canceled';

/**
 * Payment settlement reaches the server through a webhook coming from the provider
 * So a successful return has to wait for a settlement confirmation from the webhook.
 */
const POLL_INTERVAL = 2000;
const POLL_ATTEMPTS = 15;

/**
 * Lets the buyer settle a confirmed order: pay now by card, or choose to be invoiced.
 */
@Component({
  selector: 'gs2-payment',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  imports: [
    CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule
  ],
})
export class PaymentComponent implements OnInit {
  @HostBinding('class') class = 'main-container';

  private readonly destroyRef = inject(DestroyRef);

  public order: IOrder | null = null;
  public outcome: PaymentOutcome | null = null;
  public isLoading = true;
  public isPaying = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiOrderService: ApiOrderService,
    private readonly hiddenFeatures: HiddenFeaturesService,
    private readonly snackBar: MatSnackBar,
  ) {
  }

  public ngOnInit(): void {
    // Keep the feature hidden even for someone who types the url.
    if (!this.hiddenFeatures.isCardPaymentEnabled) {
      this.goToOrders();
      return;
    }

    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.outcome = this.route.snapshot.queryParamMap.get('payment') as PaymentOutcome | null;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      this.goToOrders();
      return;
    }

    if (this.outcome) {
      // Drop the parameter so reloading the page does not replay the outcome.
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }

    this.loadOrder(orderId);
  }

  public get totalAmount(): number {
    const total = Number(this.order?.total_with_vat);
    return Number.isFinite(total) ? total : 0;
  }

  public get paymentStatus(): PaymentStatus | null {
    return this.order?.payment_status ?? null;
  }

  public get isPaid(): boolean {
    return this.paymentStatus === 'SETTLED';
  }

  // Whether the buyer may start a card payment.
  public get isPayable(): boolean {
    return !!this.order
      && this.order.order_status === 'READY'
      && this.totalAmount > 0
      && !this.isCommitted
      && !this.isAwaitingSettlement;
  }

  // Waiting on the settlement webhook, so nothing to offer and nothing decided yet.
  public get isAwaitingSettlement(): boolean {
    if (this.paymentStatus === 'AUTHORIZED') {
      return true;
    }
    return this.outcome === 'success' && !this.isPaid;
  }

  public get hasFailed(): boolean {
    return this.paymentStatus === 'FAILED' || this.paymentStatus === 'CANCELED';
  }

  private get isCommitted(): boolean {
    return !!this.paymentStatus && COMMITTED_PAYMENT_STATUSES.includes(this.paymentStatus);
  }

  /**
   * We need to handle all the ways a user can arrive at this page: 
   * - To place the first card payment for an order.
   * - To retry a failed card payment.
   * - Waiting for the settlement of a successful payment.
   * - Payment was successful and order is settled.
   */
  private get shouldRenderPage(): boolean {
    return this.isPayable || this.isAwaitingSettlement || this.isPaid;
  }

  public payByCard(): void {
    if (!this.order) {
      return;
    }
    this.isPaying = true;
    this.apiOrderService.payOrder(this.order.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // `isPaying` stays true: we are leaving the page.
        next: result => this.redirectToProvider(result.redirect_url),
        // The global error interceptor has already shown the message.
        error: () => this.isPaying = false,
      });
  }

  public redirectToProvider(url: string): void {
    window.location.assign(url);
  }

  public payByInvoice(): void {
    this.snackBar.open(
      $localize`Vous recevrez une facture pour cette commande.`, 'Ok', {
        panelClass: 'notification-info'
      }
    );
    this.goToOrders();
  }

  public goToOrders(): void {
    this.router.navigate(['/account/orders']);
  }

  private loadOrder(orderId: number): void {
    this.apiOrderService.getOrderById(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(order => {
        this.isLoading = false;
        // Unknown order, or someone else's: the api scopes orders to the current user.
        if (!order) {
          this.goToOrders();
          return;
        }
        this.order = order;

        if (!this.shouldRenderPage) {
          this.goToOrders();
          return;
        }
        // Came back from a payment the webhook has not confirmed yet: keep checking.
        if (this.isAwaitingSettlement) {
          this.waitForSettlement(orderId);
        }
      });
  }

  /**
   * Re-reads the order every `POLL_INTERVAL` until the payment is decided, or we run out
   * of attempts. Stops on failure as well as on settlement.
   */
  private waitForSettlement(orderId: number, attemptsLeft = POLL_ATTEMPTS): void {
    if (attemptsLeft <= 0) {
      return;
    }

    setTimeout(() => {
      this.apiOrderService.getOrderById(orderId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(order => {
          if (order) {
            this.order = order;
          }
          if (!this.isPaymentDecided) {
            this.waitForSettlement(orderId, attemptsLeft - 1);
          }
        });
    }, POLL_INTERVAL);
  }

  /** Whether the payment reached a state that will not change on its own. */
  private get isPaymentDecided(): boolean {
    return this.isPaid || this.hasFailed;
  }
}
