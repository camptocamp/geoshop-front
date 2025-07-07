import { createReducer, on } from '@ngrx/store';

import { saveState } from './map.action';

export interface MapState {
  bounds: [number, number, number, number];
}

const initialState: MapState = {
  // Bounds in EPSG:2056
  bounds: [2699266.122561534,1140974.9002843325,2832866.122561534,1234074.9002843325]
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
