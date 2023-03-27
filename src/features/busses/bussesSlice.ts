import { createSlice } from '@reduxjs/toolkit'
import { BusState, Bus } from '../../store/models'
import { distance } from '../../utils/calculations'
import { partition } from '../../utils/tools'

const initialState: BusState = {
  busses: [],
  selectedBus: null,
  placePreviewsIsVisible: false,
  retiredBusses: [],
  updatedRoutes: [],
  stationaryBusses: [],
}

const bussesSlice = createSlice({
  name: 'busses',
  initialState,
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    allBussesSet(state, action) {
      const pastBusses = state.busses
      const withoutUpdates: Bus[] = []
      let nextBusses = action.payload
      let i2 = 0

      for (let i = 0; i < pastBusses.length; i++) {
        if (!nextBusses[i2]) {
          nextBusses = []
          break
        }
        if (
          pastBusses[i].id === nextBusses[i2].id ||
          nextBusses.some((b: Bus) => b.id === pastBusses[i].id)
        ) {
          nextBusses[i2].distance = distance(
            pastBusses[i].latitude,
            pastBusses[i].longitude,
            nextBusses[i2].latitude,
            nextBusses[i2].longitude,
          )
          nextBusses[i2].timing =
            parseInt(nextBusses[i2].timestamp, 10) -
            parseInt(pastBusses[i].timestamp, 10)
          nextBusses[i2].mph =
            (distance(
              pastBusses[i].latitude,
              pastBusses[i].longitude,
              nextBusses[i2].latitude,
              nextBusses[i2].longitude,
            ) /
              (parseInt(nextBusses[i2].timestamp, 10) -
                parseInt(pastBusses[i].timestamp, 10))) *
            3600

          if (pastBusses[i].id !== nextBusses[i2].id) i--
        } else {
          withoutUpdates.push(pastBusses[i])
          i2--
        }

        if (nextBusses[i2 + 1]) i2++
      }

      const partitioned = partition(
        nextBusses,
        (b: Bus) => b && b.distance !== 0,
      )
      partitioned[0]
        .sort(
          (x: Bus, y: Bus) =>
            parseInt(x.timestamp, 10) - parseInt(y.timestamp, 10),
        )
        .shift()

      state.retiredBusses =
        withoutUpdates && withoutUpdates.length > 0 ? withoutUpdates : []
      state.updatedRoutes =
        partitioned[0] && partitioned[0].length > 0 ? partitioned[0] : []
      state.stationaryBusses =
        partitioned[1] && partitioned[1].length > 0 ? partitioned[1] : []
      state.busses = nextBusses
    },
    selectedBusSet(state, action) {
      state.selectedBus = action.payload
    },
    busIsVisible(state, action) {
      state.placePreviewsIsVisible = action.payload
    },
  },
})

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const { allBussesSet, selectedBusSet, busIsVisible } =
  bussesSlice.actions

// Export the slice reducer as the default export
export default bussesSlice.reducer
