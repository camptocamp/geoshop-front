import { NgModule } from '@angular/core';
import { AuthModule } from 'angular-auth-oidc-client';


@NgModule({
    imports: [AuthModule.forRoot({
        config: {
            authority: 'https://geoshop-demo-syazg0.zitadel.cloud',
            redirectUrl: 'http://localhost:4200/auth/callback',
            postLogoutRedirectUri: 'http://localhost:4200/signedout',
            clientId: '282572278376605764',
            scope: 'openid profile email address phone', // 'openid profile ' + your scopes
            responseType: 'code',
            silentRenew: true,
            useRefreshToken: true,
            renewTimeBeforeTokenExpiresInSeconds: 30,
          }
      })],
    exports: [AuthModule],
})
export class OidcAuthConfigModule {}
