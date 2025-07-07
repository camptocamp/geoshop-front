import { createReducer, on } from '@ngrx/store';

import { saveState } from './map.action';

export interface MapState {
  bounds: [number, number, number, number];
}

const initialState: MapState = {
  // Swiss bounds in EPSG: 2056
  bounds: [2419995.7488073637, 1030006.663199476, 2900009.727428728, 1350004.292478851]
};

export const reducer = createReducer(
  initialState,
  on(saveState, (currentState, { state }) => {
    return {
      ...currentState,
      ...state
    };
  })
)
