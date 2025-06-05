import { Action, ActionReducer, ActionReducerMap, createFeatureSelector, createSelector, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { AuthState } from './auth/auth.reducer';
import * as fromAuth from './auth/auth.reducer';
import { CartState } from './cart/cart.reducer';
import * as fromCart from './cart/cart.reducer';
import { storageMetaReducer } from './storage.reducer';
import * as fromMap from './map/map.reducer';
import { MapState } from './map/map.reducer';
import { environment } from '../../environments/environment';

export interface AppState {
  auth: AuthState;
  cart: CartState;
  map: MapState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.reducer,
  cart: fromCart.reducer,
  map: fromMap.reducer,
};

export function logger(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return (state: AppState, action: Action<string>): AppState => {
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? [logger, storeFreeze, storageMetaReducer]
  : [storageMetaReducer];

// AUTH store
export const authFeatureSelector = createFeatureSelector<fromAuth.AuthState>('auth');
export const isLoggedIn = createSelector(
  authFeatureSelector,
  (state) => state.loggedIn
);
export const getUser = createSelector(
  authFeatureSelector,
  (state) => state.user
);
export const getToken = createSelector(
  authFeatureSelector,
  (state) => state.user ? state.user.token : null
);

// CART store
export const cartFeatureSelector = createFeatureSelector<fromCart.CartState>('cart');

export const selectAllProduct = createSelector(
  cartFeatureSelector,
  fromCart.selectAllProduct
);
export const selectCartTotal = createSelector(
  cartFeatureSelector,
  fromCart.selectCartTotal
);
export const selectOrder = createSelector(
  cartFeatureSelector,
  fromCart.selectOrder
);

// Map store
export const mapFeatureSelector = createFeatureSelector<fromMap.MapState>('map');
export const selectMapState = createSelector(
  mapFeatureSelector,
  (state: fromMap.MapState) => state
);
