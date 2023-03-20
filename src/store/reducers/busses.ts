import {
  SET_ALL_BUSSES,
  SET_SELECTED_BUS,
  SET_BUS_PREVIEW_VISIBILITY,
} from '../actions'
import { BusState } from '../models'

const initialState: BusState = {
  busses: [],
  selectedBus: null,
  placePreviewsIsVisible: false,
}

const bussesReducer = (
  state: BusState = initialState,
  action: { type: string; payload: any },
): BusState => {
  switch (action.type) {
    case SET_ALL_BUSSES: {
      return { ...state, busses: action.payload }
    }
    case SET_SELECTED_BUS: {
      return { ...state, selectedBus: action.payload }
    }
    case SET_BUS_PREVIEW_VISIBILITY: {
      return { ...state, placePreviewsIsVisible: action.payload }
    }

    default: {
      return state
    }
  }
}

export default bussesReducer
