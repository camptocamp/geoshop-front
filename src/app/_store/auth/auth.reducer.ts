import * as AuthActions from './auth.action';
import {IIdentity} from '../../_models/IIdentity';
import {Action, createReducer, on} from '@ngrx/store';

export interface AuthState {
  loggedIn: boolean;
  autoLoginFailed: boolean;
  user: Partial<IIdentity> | null;
}

const initialState: AuthState = {
  loggedIn: false,
  autoLoginFailed: false,
  user: null,
};

const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (state, {identity}) => ({...state, loggedIn: true, user: identity})),
  on(AuthActions.refreshTokenSuccess, (state, {token}) => {
    const user = Object.assign({}, state.user);
    user.token = token;
    return {...state, loggedIn: true, user};
  }),
  on(AuthActions.refreshTokenFailure, (state) => ({...state, loggedIn: false, user: null})),
  on(AuthActions.loginFailure, (state) => ({...state, loggedIn: false, user: null})),
  on(AuthActions.logout, state => ({...state, loggedIn: false, user: null}))
);

export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action);
}

