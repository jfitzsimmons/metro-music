import { SET_VOLUME, PAUSE_ORCHESTRA } from "../actions";
import { ControlState } from "../models";

const initialState: ControlState = {
  volume: ".2",
  pause: true,
};

const controlsReducer = (
  state = initialState,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case SET_VOLUME: {
      return { ...state, volume: action.payload };
    }
    case PAUSE_ORCHESTRA: {
      return { ...state, pause: action.payload };
    }
    default: {
      return state;
    }
  }
};

export default controlsReducer;
