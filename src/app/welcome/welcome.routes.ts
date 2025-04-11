import { Routes } from '@angular/router';

import { DownloadComponent } from './download/download.component';
import { ValidateComponent } from './validate/validate.component';
import { WelcomeComponent } from './welcome.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'download/:uuid', component: DownloadComponent },
  { path: 'validate/orderitem/:token', component: ValidateComponent },
];
