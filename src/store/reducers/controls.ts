import { SET_VOLUME, PAUSE_ORCHESTRA, CHOOSE_PROGRESSION, SET_CHANGE_TYPE } from "../actions";
import { ControlState } from "../models";

const initialState: ControlState = {
  volume: ".2",
  pause: false,
  progression: 0,
  changeType: "ndChanges"
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
    case CHOOSE_PROGRESSION: {
      return { ...state, progression: action.payload };
    }
    case SET_CHANGE_TYPE: {
      return { ...state, chagneType: action.payload };
    }
    default: {
      return state;
    }
  }
};

export default controlsReducer;