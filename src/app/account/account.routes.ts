import { Routes } from '@angular/router';

import { NewOrderComponent } from './new-order/new-order.component';
import { OrdersComponent } from './orders/orders.component';
import { PaymentComponent } from './payment/payment.component';
import { ModifyProfileComponent } from './profile/modify-profile.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  { path: 'new-order', component: NewOrderComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'orders/:id/payment', component: PaymentComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'modify-profile', component: ModifyProfileComponent },
];
