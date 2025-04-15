
import { routes } from '@app/app.routes';
import { interceptor as authInterceptor } from '@app/interceptors/authInterceptor';
import { ConfigService } from '@app/services/config.service';
import * as store from '@app/store';
import { AuthEffects } from '@app/store/auth/auth.effects';
import { CartEffects } from '@app/store/cart/cart.effects';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideAuth, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';



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
