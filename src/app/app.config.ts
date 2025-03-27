import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';
import { ConfigService } from './_services/config.service';
import { provideStore } from '@ngrx/store';

const configFactory = (httpClient: HttpClient) => {
  const service = new ConfigService(httpClient);
  service.load();
  return service;
}

const authFactory = (configService: ConfigService) => {
  const config = configService.config;
  return config?.oidcConfig ? new StsConfigStaticLoader(config.oidcConfig) : [];
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi(),
    ),
    provideRouter(routes),
    provideStore(),
    {
      provide: ConfigService,
      useFactory: configFactory,
      deps: [HttpClient],
    },
    {
      provide: StsConfigLoader,
      useFactory: authFactory,
      deps: [ConfigService],
    },
  ]
};
