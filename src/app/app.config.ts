import { ApplicationConfig, provideZoneChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideAuth, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';
import { ConfigService } from './_services/config.service';
import { provideStore } from '@ngrx/store';
import { provideAnimations } from '@angular/platform-browser/animations';
import * as store from './_store/index';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './_store/auth/auth.effects';
import { CartEffects } from './_store/cart/cart.effects';


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
      withInterceptorsFromDi(),
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
