import {createAction, props} from '@ngrx/store';
import { MapState } from './map.reducer';

export const SAVE_STATE = '[Map] Save state';

export const saveState = createAction(
  SAVE_STATE,
  props<{ state: MapState }>()
);
