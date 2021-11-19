import { SET_SEARCH_VISIBILITY, SET_SWEEP_TIME, SET_NEW_TEXT } from "../actions";
import { SearchState } from "../models";

const initialState: SearchState = {
  searchIsVisible: false,
  sweepTime: 0,
  textCues: [
    {
      id:"welcome",
      text: "Welcome to the performance of the St. Louis Metro.",
      class: "welcome"
    }
  ],
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
    case SET_NEW_TEXT: {
      return { ...state, textCues: [...state.textCues, action.payload]};
    }
    default: {
      return state;
    }
  }
};

export default searchReducer;
