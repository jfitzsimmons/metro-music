import { SET_SCORE_VISIBILITY, SET_SWEEP_TIME, SET_NEW_TEXT } from '../actions'
import { ScoreState } from '../models'

const initialState: ScoreState = {
  scoreIsVisible: true,
  sweepTime: 0,
  textCues: [
    {
      id: 'welcome',
      text: 'Welcome to the performance of the St. Louis Metro.',
      class: 'welcome',
    },
  ],
}

const scoreReducer = (
  action: { type: string; payload: any },
  state = initialState,
) => {
  switch (action.type) {
    case SET_SCORE_VISIBILITY: {
      return { ...state, scoreIsVisible: action.payload }
    }
    case SET_SWEEP_TIME: {
      return { ...state, sweepTime: action.payload }
    }
    case SET_NEW_TEXT: {
      return { ...state, textCues: [...state.textCues, action.payload] }
    }
    default: {
      return state
    }
  }
}

export default scoreReducer
