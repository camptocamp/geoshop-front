import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.routes) },
  { path: 'account', loadChildren: () => import('./account/account.routes').then(m => m.routes) },
  { path: 'welcome', loadChildren: () => import('./welcome/welcome.routes').then(m => m.routes) },
];
