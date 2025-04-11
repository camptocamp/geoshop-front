
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideAuth, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';

import { interceptor as authInterceptor } from './_interceptors/authInterceptor';
import { ConfigService } from './_services/config.service';
import { AuthEffects } from './_store/auth/auth.effects';
import { CartEffects } from './_store/cart/cart.effects';
import * as store from './_store/index';
import { routes } from './app.routes';


const stsConfigFactory = () => {
  const configService = inject(ConfigService);
  const config = configService.config;
  return config?.oidcConfig ? new StsConfigStaticLoader(config.oidcConfig) : [];
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
    ),
    provideAuth({
      loader: {
        provide: StsConfigLoader,
        useFactory: stsConfigFactory,
        deps: [ConfigService],
      },
    }),
    provideEffects(AuthEffects, CartEffects),
    provideStore(store.reducers, { metaReducers: store.metaReducers }),
    provideAppInitializer(() => inject(ConfigService).load())
  ]
};
