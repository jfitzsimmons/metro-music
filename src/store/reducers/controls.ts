import { SET_VOLUME, PAUSE_ORCHESTRA, CHOOSE_PROGRESSION, SET_CHANGE_TYPE } from "../actions";
import { ControlState } from "../models";

const initialState: ControlState = {
  volume: ".5",
  pause: false,
  progression: {
    label: "IV-I-V-vi in A Major",
    index: 0,
  },
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
      return { ...state, changeType: action.payload };
    }
    default: {
      return state;
    }
  }
};

export default controlsReducer;