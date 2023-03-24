import { createSlice } from '@reduxjs/toolkit'
import { ScoreState } from '../../store/models'

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

const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    scoreVisibilitySet(state) {
      state.scoreIsVisible = state.scoreIsVisible !== true
    },
    sweepTimeSet(state, action) {
      state.sweepTime = action.payload
    },
    newTextAdded(state, action) {
      state.textCues = [...state.textCues, action.payload]
    },
  },
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { scoreVisibilitySet, sweepTimeSet, newTextAdded } =
  scoreSlice.actions

// Export the slice reducer as the default export
export default scoreSlice.reducer
