import {createAction, props} from '@ngrx/store';
import {ICredentials, IIdentity} from '../../_models/IIdentity';
import {IApiResponseError} from '../../_models/IApi';
import { LoginResponse } from 'angular-auth-oidc-client';

export const LOGIN = '[Auth] Login';
export const OIDC_LOGIN = '[Auth] Oidc Login';
export const OIDC_AUTO_LOGIN_FAILURE = '[Auth] Oidc Auto Login';
export const REFRESH_TOKEN = '[Auth] Refresh token';
export const REFRESH_TOKEN_SUCCESS = '[Auth] Refresh token success';
export const REFRESH_TOKEN_FAILURE = '[Auth] Refresh token failure';
export const LOGIN_SUCCESS = '[Auth] Login success';
export const LOGIN_FAILURE = '[Auth] Login failure';
export const LOGOUT = '[Auth] Logout';
export const LOGOUT_SUCCESS = '[Auth] Logout success';

export const login = createAction(
  LOGIN,
  props<{ credentials: ICredentials, callbackUrl: string }>()
);

export const oidcLogin = createAction(
  OIDC_LOGIN,
  props<LoginResponse>()
);

export const refreshToken = createAction(
  REFRESH_TOKEN,
  props<{ token: string; }>()
);

export const refreshTokenSuccess = createAction(
  REFRESH_TOKEN_SUCCESS,
  props<{ token: string; }>()
);
export const refreshTokenFailure = createAction(
  REFRESH_TOKEN_FAILURE,
  props<IApiResponseError>()
);

export const loginSuccess = createAction(
  LOGIN_SUCCESS,
  props<{ identity: Partial<IIdentity>, callbackUrl: string }>()
);

export const loginFailure = createAction(
  LOGIN_FAILURE,
  props<IApiResponseError>());

export const logout = createAction(LOGOUT);

export const logoutSuccess = createAction(
  LOGOUT_SUCCESS,
);
