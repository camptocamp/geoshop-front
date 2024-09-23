import { NgModule } from '@angular/core';
import { AuthModule, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';
import { ConfigService } from '../_services/config.service';


const authFactory = (configService: ConfigService) => {
  const config = configService.config;
  return config?.oidcConfig ? new StsConfigStaticLoader(config.oidcConfig) : [];
};

@NgModule({
  imports: [
    AuthModule.forRoot({
      loader: {
        provide: StsConfigLoader,
        useFactory: authFactory,
        deps: [ConfigService],
      },
    }),
  ],
  exports: [AuthModule],
})
export class OidcAuthConfigModule {}
