import { Routes } from '@angular/router';

import { AccountComponent } from './account.component';
import { NewOrderComponent } from './new-order/new-order.component';
import { OrdersComponent } from './orders/orders.component';
import { ProfileComponent } from './profile/profile.component';
import { ModifyProfileComponent } from './profile/modify-profile.component';

export const routes: Routes = [
  { path: '', component: AccountComponent },
  { path: 'new-order', component: NewOrderComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'modify-profile', component: ModifyProfileComponent },
];
