import {
  SET_ALL_BUSSES,
  SET_SELECTED_BUS,
  SET_BUS_PREVIEW_VISIBILITY,

} from "../actions";
import { BusState } from "../models";

const initialState: BusState = { 
  busses: [],
  selectedBus: null,
  placePreviewsIsVisible: false,
};

const bussesReducer = (
  state: BusState = initialState,
  action: { type: string; payload: any }
): BusState => {
  switch (action.type) {

    case SET_ALL_BUSSES: {
/**
      state.busses.map((place) => {
        console.log(place.isRecord())
      });
 */
//console.log(action.payload);
      return { ...state, busses: action.payload };



      /** 
      console.log(action.payload)
      return { ...state, 
        busses: state.busses.map((place) => {
          let poop = (place.vehicle.vehicle.id === action.payload.vehicle.vehicle.id) ? action.payload : place;
          return poop;
        }),
      };
      */
    }
    case SET_SELECTED_BUS: {
      return { ...state, selectedBus: action.payload };
    }
    case SET_BUS_PREVIEW_VISIBILITY: {
      return { ...state, placePreviewsIsVisible: action.payload };
    }

    default: {
      return state;
    }
  }
};

export default bussesReducer;