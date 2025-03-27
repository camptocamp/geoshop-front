import { Routes } from '@angular/router';

import { WelcomeComponent } from './welcome.component';
import { DownloadComponent } from './download/download.component';
import { ValidateComponent } from './validate/validate.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'download/:uuid', component: DownloadComponent },
  { path: 'validate/orderitem/:token', component: ValidateComponent },
];
