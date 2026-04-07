import {
  ContactForm,
  createContactForm,
  createOrderForm, createOrderItemForm,
  OrderForm, OrderItemForm
} from "@app/account/new-order/order-form.model";
import {
  ContactPricingStepComponent
} from "@app/account/new-order/steps/contact-pricing-step/contact-pricing-step.component";
import {DataFormatStepComponent} from "@app/account/new-order/steps/data-format-step/data-format-step.component";
import {OrderTypeStepComponent} from "@app/account/new-order/steps/order-type-step/order-type-step.component";
import * as Constants from '@app/constants';
import {Contact, IContact} from '@app/models/IContact';
import {IOrder, Order, IOrderItem} from '@app/models/IOrder';
import {IProduct} from '@app/models/IProduct';
import {ApiOrderService} from '@app/services/api-order.service';
import {ApiService} from '@app/services/api.service';
import {ConfigService} from '@app/services/config.service';
import {StoreService} from '@app/services/store.service';
import {AppState, getUser, selectOrder, selectAllProduct} from '@app/store';
import * as fromCart from '@app/store/cart/cart.action';

import {AsyncPipe, CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, DestroyRef, HostBinding, inject, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatOptionModule} from '@angular/material/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatSort} from '@angular/material/sort';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {debounceTime, filter, map, mergeMap, startWith, switchMap} from 'rxjs/operators';

@Component({
  selector: 'gs2-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss'],
  imports: [
    AsyncPipe, CommonModule, FormsModule, MatAutocompleteModule, MatButtonModule,
    MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatOptionModule, MatProgressSpinnerModule, MatSelectModule,
    MatStepperModule, MatTableModule, ReactiveFormsModule,
    OrderTypeStepComponent, ContactPricingStepComponent, DataFormatStepComponent
  ],
})
export class NewOrderComponent implements OnInit {
  @HostBinding('class') class = 'main-container';
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('stepper') stepper: MatStepper;

  private destroyRef = inject(DestroyRef);

  public readonly AppConstants = Constants;
  public orderFormGroup: FormGroup<OrderForm>;
  public contactFormGroup: FormGroup<ContactForm>;
  public orderItemFormGroup: FormGroup<OrderItemForm>;

  public currentOrder: Order;
  public invoiceContact: Contact | undefined;

  readonly orderTypes$ = this.apiOrderService.getOrderTypes().pipe(
    takeUntilDestroyed(),
    map((orderTypes) => orderTypes ? orderTypes : []));

  public readonly currentUser$ = this.store.select(getUser);
  public filteredCustomers$: Observable<IContact[]> = of([]);

  // order item form: table's attributes
  public allAvailableFormats: Set<string>;
  public dataSource: MatTableDataSource<IOrderItem>;
  public products: IProduct[] = [];

  get orderTypeCtrl() {
    return this.orderFormGroup?.get('orderType');
  }

  get IsAddressForCurrentUser(): boolean {
    return this.contactFormGroup?.get('addressChoice')?.value === '1';
  }

  get buttonConfirmLabel():string {
    if (!this.currentOrder) return "";
    return this.currentOrder.items.every(x => x.price_status !== 'PENDING') ?
      $localize`Acheter maintenant` :
      $localize`Demander un devis`;
  }

  private allProducts$ = this.store.pipe(
    takeUntilDestroyed(),
    select(selectAllProduct)
  );

  private currentOrder$ = this.store.pipe(
    takeUntilDestroyed(),
    select(selectOrder),
    switchMap(x => this.apiOrderService.getFullOrder(x)),
  );

  constructor(private formBuilder: NonNullableFormBuilder,
              private apiOrderService: ApiOrderService,
              private apiService: ApiService,
              private storeService: StoreService,
              private router: Router,
              private store: Store<AppState>,
              private dialog: MatDialog,
              private config: ConfigService,
              private cdr: ChangeDetectorRef) {

    this.createForms();
  }

  ngOnInit(): void {
    this.allProducts$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((cartProducts: IProduct[]) => {
      this.products = cartProducts;
    });

    this.currentOrder$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(order => {
      if (order) {
        this.currentOrder = order;
        this.updateForms();
      }
    });
    const customer = this.contactFormGroup.get('customer');
    if (!customer) {
      return;
    }
    this.filteredCustomers$ = customer.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      debounceTime(500),
      startWith(''),
      filter(x => typeof x === 'string' && x.length > 2),
      mergeMap(searchString => {
        return this.apiService.find<IContact>(searchString, 'contact');
      }),
      map(x => {
        return x ? x.results : [];
      })
    );

    //this._createOrUpdateDraftOrder(undefined, 0);
  }

  private createForms() {
    this.orderFormGroup = createOrderForm();
    this.contactFormGroup = createContactForm();
    this.orderItemFormGroup = createOrderItemForm();
  }

  public resetForms() {
    this.createForms();
    this.updateForms();
  }

  // Update form values from an order
  private updateForms() {
    this.orderFormGroup.patchValue({
      orderType: this.currentOrder.order_type === Constants.ORDERTYPE_PUBLIC ? {id: 2, name: Constants.ORDERTYPE_PUBLIC} : {id: 1, name: Constants.ORDERTYPE_PRIVATE},
      title: this.currentOrder.title,
      invoice_reference: this.currentOrder.invoice_reference,
      emailDeliver: this.currentOrder.email_deliver,
      emailDeliverChoice: this.currentOrder.email_deliver ? "2" : "1",
      description: this.currentOrder.description
    });
    this.contactFormGroup.patchValue(this.invoiceContact ?? {});

    this.allAvailableFormats = new Set();
    const orderItemControls = this.orderItemFormGroup.controls.format;
    orderItemControls.clear();
    for (const item of this.currentOrder.items) {
      item.available_formats?.forEach(format => this.allAvailableFormats.add(format));
      orderItemControls.push(this.formBuilder.control(item.data_format));
    }

    this.dataSource = new MatTableDataSource(this.currentOrder.items);
    this.cdr.detectChanges();
  }

  // Create order from an order draft and the form values
  private updateOrder() {
    const orderValues = this.orderFormGroup.getRawValue();
    this.currentOrder.title = orderValues.title;
    this.currentOrder.invoice_reference = orderValues.invoice_reference;
    this.currentOrder.email_deliver = orderValues.emailDeliverChoice === '2' ? orderValues.emailDeliver : '';
    this.currentOrder.description = orderValues.description;
    this.currentOrder.order_type = orderValues.orderType.name;

    if (this.contactFormGroup.get('addressChoice')?.value === '2') {
      const contact: IContact = this.contactFormGroup.getRawValue();
      this.invoiceContact = contact.first_name && contact.last_name && contact.email ?
        new Contact(contact) :
        undefined;
    } else {
      this.invoiceContact = undefined;
    }
  }

  private createOrUpdateOrder(): Observable<IOrder> {
    if (this.currentOrder.id === -1) {
      return this.apiOrderService.createOrder(this.currentOrder.toPostAsJson, this.invoiceContact, this.IsAddressForCurrentUser)
        .pipe(filter(newOrder => !!newOrder));
    } else {
      return this.apiOrderService.updateOrder(this.currentOrder, this.invoiceContact, this.IsAddressForCurrentUser)
        .pipe(filter(newOrder => !!newOrder));
    }
  }

  public createOrUpdateDraft() {
    this.updateOrder();
    this.createOrUpdateOrder().subscribe(newOrder => {
      this.storeService.addOrderToStore(new Order(newOrder as IOrder));
    })
  }

  public confirm() {
    this.updateOrder();
    this.createOrUpdateOrder().pipe(
      switchMap((order: IOrder) => this.apiOrderService.confirmOrder(order.id))
    ).subscribe(async confirmed => {
      if (confirmed) {
        this.store.dispatch(fromCart.deleteOrder());
        await this.router.navigate(['/account/orders']);
      }
    });
  }

  public billingRequired(): boolean {
    return !this.config.config?.noBillingForFreeOrder ||
      !this.products.every(product => product.pricing?.pricing_type === "FREE");
  }
}
