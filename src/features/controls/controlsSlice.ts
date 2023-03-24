import { createSlice } from '@reduxjs/toolkit'
import { ControlState } from '../../store/models'

const initialState: ControlState = {
  volume: '0.5',
  pause: true,
  progression: {
    label: 'IV-I-V-vi in A Major',
    index: 0,
  },
  signalType: null,
  freshRender: null,
}

const controlsSlice = createSlice({
  name: 'controls',
  initialState,
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    volumeSet(state, action) {
      state.volume = action.payload
    },
    orchestraPaused(state, action) {
      state.pause = action.payload
    },
    progressionChosen(state, action) {
      state.progression = action.payload
    },
    signalTypeSet(state, action) {
      state.signalType = action.payload
    },
    freshRenderSet(state, action) {
      state.freshRender = action.payload
    },
  },
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const {
  volumeSet,
  orchestraPaused,
  progressionChosen,
  signalTypeSet,
  freshRenderSet,
} = controlsSlice.actions

// Export the slice reducer as the default export
export default controlsSlice.reducer
