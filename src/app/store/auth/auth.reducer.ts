import { IIdentity } from '@app/models/IIdentity';

import { Action, createReducer, on } from '@ngrx/store';

import * as AuthActions from './auth.action';

export interface AuthState {
  loggedIn: boolean;
  loginFailed: boolean;
  user: Partial<IIdentity> | null;
}

const initialState: AuthState = {
  loggedIn: false,
  loginFailed: false,
  user: null,
};

const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (state, { identity }) => ({ ...state, loggedIn: true, loginFailed: false, user: identity })),
  on(AuthActions.refreshTokenSuccess, (state, { token }) => {
    const user = Object.assign({}, state.user);
    user.token = token;
    return { ...state, loggedIn: true, loginFailed: false, user };
  }),
  on(AuthActions.refreshTokenFailure, (state) => ({ ...state, loggedIn: false, loginFailed: true, user: null })),
  on(AuthActions.loginFailure, (state) => ({ ...state, loggedIn: false, loginFailed: true, user: null })),
  on(AuthActions.logout, state => ({ ...state, loggedIn: false, user: null }))
);

export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action);
}

