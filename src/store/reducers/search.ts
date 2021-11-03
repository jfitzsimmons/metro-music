import { SET_SEARCH_VISIBILITY, SET_SWEEP_TIME } from "../actions";
import { SearchState } from "../models";

const initialState: SearchState = {
  searchIsVisible: false,
  sweepTime: 0,
};

const searchReducer = (
  state = initialState,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case SET_SEARCH_VISIBILITY: {
      return { ...state, searchIsVisible: action.payload };
    }
    case SET_SWEEP_TIME: {
      return { ...state, sweepTime: action.payload };
    }
    default: {
      return state;
    }
  }
};

export default searchReducer;
