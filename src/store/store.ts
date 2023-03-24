import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'

import bussesReducer from '../features/busses/bussesSlice'
import controlsReducer from '../features/controls/controlsSlice'
import scoreReducer from '../features/score/scoreSlice'

// Automatically adds the thunk middleware and the Redux DevTools extension
const store = configureStore({
  reducer: {
    busses: bussesReducer,
    controls: controlsReducer,
    score: scoreReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch //

export default store
