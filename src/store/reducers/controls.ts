import {
  SET_VOLUME,
  PAUSE_ORCHESTRA,
  CHOOSE_PROGRESSION,
  SET_SIGNAL_TYPE,
  SET_FRESH_RENDER,
} from '../actions'
import { ControlState } from '../models'

const initialState: ControlState = {
  volume: '.5',
  pause: true,
  progression: {
    label: 'IV-I-V-vi in A Major',
    index: 0,
  },
  signalType: null,
  freshRender: null,
}

const controlsReducer = (
  state = initialState,
  action: { type: string; payload: any },
) => {
  switch (action.type) {
    case SET_VOLUME: {
      return { ...state, volume: action.payload }
    }
    case PAUSE_ORCHESTRA: {
      return { ...state, pause: action.payload }
    }
    case CHOOSE_PROGRESSION: {
      return { ...state, progression: action.payload }
    }
    case SET_SIGNAL_TYPE: {
      return { ...state, signalType: action.payload }
    }
    case SET_FRESH_RENDER: {
      return { ...state, freshRender: action.payload }
    }
    default: {
      return state
    }
  }
}

export default controlsReducer
