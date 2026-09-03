import { IOrder } from '@app/models/IOrder';
import { PaymentStatus } from '@app/models/IPayment';
import { ApiOrderService } from '@app/services/api-order.service';
import { HiddenFeaturesService } from '@app/services/hidden-features.service';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PaymentComponent } from './payment.component';


const payableOrder = {
  id: 11710,
  title: 'Une commande',
  order_status: 'READY',
  total_with_vat: '42.00',
  total_with_vat_currency: 'CHF',
  payment_status: null,
} as unknown as IOrder;

const withPaymentStatus = (payment_status: PaymentStatus) =>
  ({ ...payableOrder, payment_status } as IOrder);

/** Builds a component with the route params and api responses a test needs. */
const setup = (options: {
  id?: string;
  payment?: string | null;
  order?: IOrder | null;
  cardPaymentEnabled?: boolean;
} = {}) => {
  const order = 'order' in options ? options.order : payableOrder;
  const getOrderById = vi.fn().mockReturnValue(of(order));
  const payOrder = vi.fn().mockReturnValue(of({
    redirect_url: 'https://checkout.postfinance.ch/s/1234',
    payment_id: 1,
    amount: '42.00',
  }));
  const navigate = vi.fn();

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [PaymentComponent, NoopAnimationsModule],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ApiOrderService, useValue: { getOrderById, payOrder } },
      {
        provide: HiddenFeaturesService,
        useValue: { isCardPaymentEnabled: options.cardPaymentEnabled ?? true },
      },
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: { get: () => options.id ?? '11710' },
            queryParamMap: { get: () => options.payment ?? null },
          },
        },
      },
    ],
  });

  const fixture: ComponentFixture<PaymentComponent> = TestBed.createComponent(PaymentComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, getOrderById, payOrder, navigate };
};

describe('PaymentComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('offers both options for a confirmed order that costs something', () => {
    const { component } = setup();
    expect(component.isPayable).toBe(true);
    expect(component.totalAmount).toBe(42);
  });

  it('leaves without loading anything when the feature is off', () => {
    const { getOrderById, navigate } = setup({ cardPaymentEnabled: false });
    expect(getOrderById).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/account/orders']);
  });

  it('leaves when the order cannot be loaded', () => {
    const { component, navigate } = setup({ order: null });
    expect(component.isPayable).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/account/orders']);
  });

  it('leaves when there is nothing to pay', () => {
    const freeOrder = { ...payableOrder, total_with_vat: '0.00' } as IOrder;
    const { component, navigate } = setup({ order: freeOrder });
    expect(component.isPayable).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/account/orders']);
  });

  it('leaves when the order is not confirmed yet', () => {
    const pendingOrder = { ...payableOrder, order_status: 'PENDING' } as IOrder;
    const { navigate } = setup({ order: pendingOrder });
    expect(navigate).toHaveBeenCalledWith(['/account/orders']);
  });

  it('stays to say so when the order is already paid, and offers no payment', () => {
    const { component, navigate } = setup({ order: withPaymentStatus('SETTLED') });
    expect(component.isPaid).toBe(true);
    expect(component.isPayable).toBe(false);
    expect(navigate).not.toHaveBeenCalledWith(['/account/orders']);
  });

  it('shows the retry notice for a failed payment, keeping both options', () => {
    const { component } = setup({ order: withPaymentStatus('FAILED') });
    expect(component.hasFailed).toBe(true);
    expect(component.isPayable).toBe(true);
  });

  it('treats a cancelled payment the same as a failed one', () => {
    const { component } = setup({ order: withPaymentStatus('CANCELED') });
    expect(component.hasFailed).toBe(true);
    expect(component.isPayable).toBe(true);
  });

  it('blocks a second payment once the funds are authorized, whatever the url says', () => {
    const { component } = setup({ order: withPaymentStatus('AUTHORIZED'), payment: null });
    expect(component.isPayable).toBe(false);
    expect(component.isAwaitingSettlement).toBe(true);
  });

  it('still offers the button for an open session, since paying resumes it', () => {
    const { component } = setup({ order: withPaymentStatus('PENDING') });
    expect(component.isPayable).toBe(true);
    expect(component.isAwaitingSettlement).toBe(false);
  });

  it('waits instead of offering when the buyer just came back from a payment', () => {
    const { component } = setup({ payment: 'success', order: withPaymentStatus('PENDING') });
    expect(component.isPayable).toBe(false);
    expect(component.isAwaitingSettlement).toBe(true);
  });

  it('reports settled once the webhook has landed', () => {
    const { component } = setup({ payment: 'success', order: withPaymentStatus('SETTLED') });
    expect(component.isAwaitingSettlement).toBe(false);
    expect(component.isPaid).toBe(true);
    expect(component.isPayable).toBe(false);
  });

  it('sends the buyer to the provider on card payment', () => {
    const { component, payOrder } = setup();
    const redirect = vi.spyOn(component, 'redirectToProvider').mockImplementation(() => undefined);

    component.payByCard();

    expect(payOrder).toHaveBeenCalledWith(11710);
    expect(redirect).toHaveBeenCalledWith('https://checkout.postfinance.ch/s/1234');
  });

  it('calls nothing and leaves when the invoice is chosen', () => {
    const { component, payOrder, navigate } = setup();
    component.payByInvoice();

    expect(payOrder).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/account/orders']);
  });
});
