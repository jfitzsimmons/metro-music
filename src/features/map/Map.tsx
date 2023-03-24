import React, { useEffect, useCallback, useRef, createRef, memo } from 'react'
import L, { LatLngExpression } from 'leaflet'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import { Bus } from '../../store/models'
import {
  playSweep,
  noteFreq,
  resetAudioContext,
  progressions,
  playChord,
} from '../../utils/webAudio'
import { countBy, rndmRng } from '../../utils/calculations'
import { getAdsr, pickOctaveByLat, pickOctave } from '../../utils/waveShaping'
import { usePrevious, chooseEnvEndpoint } from '../../utils/tools'
import './map.css'
import store from '../../store/store'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { allBussesSet } from '../busses/bussesSlice'
import { newTextAdded } from '../score/scoreSlice'
import { freshRenderSet, signalTypeSet } from '../controls/controlsSlice'

const markerRefs: React.RefObject<L.Marker>[] = []
let longAvg = -90.28392791748047
let progress = 0
let multiplier = 0
let chord = 0
let start = 0
let concertStart = 0

const cleanBusData = (entities: any) => {
  const cleaned: Bus[] = []
  entities.forEach((e: any) => {
    cleaned.push({
      id: e.vehicle.vehicle.id,
      latitude: e.vehicle.position.latitude,
      longitude: e.vehicle.position.longitude,
      timestamp: e.vehicle.timestamp,
      label: e.vehicle.vehicle.label,
    })
  })

  return cleaned
}

const findMarker = (id: string) =>
  markerRefs.find(
    (m) =>
      m.current &&
      m.current.options &&
      m.current.options.icon &&
      m.current.options.icon.options &&
      m.current.options.icon.options.className &&
      m.current.options.icon.options.className.includes(`map-icon_${id}`),
  )

function handleStaleVehicles(noMoves: Bus[], prog: number) {
  const currentProgress = Math.round(Date.now() / 1000) - concertStart
  const delay =
    currentProgress < 7 ? 7 - currentProgress : 8 - ((currentProgress % 8) + 1)

  noMoves.forEach((v, i) => {
    if (i < 4) {
      type OctaveKey = keyof typeof noteFreq
      const octave: OctaveKey = pickOctave(6 - i)
      const octaveNoteFreqs = noteFreq[octave]
      type NoteKey = keyof typeof octaveNoteFreqs
      const note: NoteKey = progressions[prog][3][Math.round(rndmRng(3, 0))]
      if (note) playChord(noteFreq[octave][note], delay)
    }
  })

  setTimeout(
    () =>
      store.dispatch(
        newTextAdded({
          id: `retired${Date.now()}`,
          text: `${noMoves.length} ${
            noMoves.length === 1 ? 'bus is' : 'busses are'
          } without updates`,
          class: `retired`,
        }),
      ),
    delay * 1000,
  )
}

const BusMarker = memo(({ place, selectedBus, showPreview }: any) => {
  const newRef = createRef<L.Marker>()
  markerRefs.push(newRef)
  return (
    <Marker
      key={place.id}
      position={[place.latitude, place.longitude]}
      eventHandlers={{ click: () => showPreview(place) }}
      icon={L.divIcon({
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, 0],
        shadowSize: [0, 0],
        className: `map-icon map-icon_${place.id} ${
          selectedBus && selectedBus.id === place.id && 'icon-selected'
        }`,
      })}
      ref={newRef as React.RefObject<L.Marker>}
    >
      <Tooltip>{place.label}</Tooltip>
    </Marker>
  )
})

export default function Map() {
  const dispatch = useAppDispatch()
  const { busses, retiredBusses, updatedRoutes } = useAppSelector(
    (state) => state.busses,
  )
  const { volume, pause, signalType, freshRender, progression } =
    useAppSelector((state) => state.controls)
  const timeout: { current: NodeJS.Timeout | null } = useRef(null)
  const defaultPosition: LatLngExpression = [38.65727, -90.29789]
  const prevBusses = usePrevious(busses)
  const prevPause = usePrevious(pause)
  const prevFreshRender = usePrevious(freshRender)

  const countDown = useCallback(
    (timer: number) => {
      if (timer >= 1000) {
        for (let i = timer; (i -= 1000); ) {
          setTimeout(() => {
            dispatch(
              newTextAdded({
                id: `countdown${Date.now()}`,
                text: `${i === 1000 ? 'updates in' : '...'} ${
                  (timer - i) / 1000
                }`,
                class: `loading`,
              }),
            )
          }, i)
        }
      }
    },
    [dispatch],
  )

  const makeMusicAndDance = useCallback(
    (routes: Bus[]) => {
      if (!routes || routes.length === 0) {
        dispatch(
          newTextAdded({
            id: `loading${Date.now()}`,
            text: `No new updates.  Trying again.  loading...`,
            class: `loading`,
          }),
        )
        countDown(4000)
        return 4000
      }

      dispatch(
        newTextAdded({
          id: `newdata${Date.now()}`,
          text: `There are currently ${routes.length} busses making moves`,
          class: `newdata`,
        }),
      )

      let timestampDupes: any = {}
      timestampDupes = countBy(
        routes,
        (r: { timestamp: number }) => r.timestamp,
      )

      const batchStart = parseInt(
        routes
          .slice()
          .sort(
            (x: Bus, y: Bus) =>
              parseInt(x.timestamp, 10) - parseInt(y.timestamp, 10),
          )[0].timestamp,
        10,
      )

      let count = 1

      if (concertStart === 0) concertStart = batchStart

      routes.forEach((r: Bus, i: number) => {
        progress = parseInt(r.timestamp, 10) - concertStart // play time in current batch
        multiplier = Math.floor(progress / 8) // helps narrow scope to single measure
        // narrow scope to a single chord in progression
        chord =
          progress >= 8
            ? Math.floor((progress - 8 * multiplier) / 2)
            : Math.floor(progress / 2)

        type OctaveKey = keyof typeof noteFreq
        const octave: OctaveKey = pickOctaveByLat(r.latitude)
        const octaveNoteFreqs = noteFreq[octave]
        type NoteKey = keyof typeof octaveNoteFreqs
        const note: NoteKey =
          progressions[progression.index][chord][Math.round(rndmRng(3, 0))] // Ex: C#

        // stutter simultaneous start times
        if (routes[i - 1] && r.timestamp === routes[i - 1].timestamp) {
          start =
            parseInt(r.timestamp, 10) -
            batchStart +
            (1 / timestampDupes[r.timestamp]) * count
          count++
        } else {
          start = parseInt(r.timestamp, 10) - batchStart
          count = 1
        }

        let end: number = 0
        let adsr: number = 0
        if (r && r.distance) end = r.distance < 0.05 ? 0.05 : r.distance
        end *= 10
        if (end > 4) end = 4
        if (r && r.mph) adsr = getAdsr(r.mph)
        if (r.latitude > 38.66) longAvg = -90.3517098
        const pan =
          (Math.abs(longAvg) - Math.abs(r.longitude)) * 6 * (octave * 0.15)

        const found = findMarker(r.id)
        // testjpf need to track timeout and clear on abort!
        // push to an array, etc...
        setTimeout(() => {
          if (found && found.current) {
            found.current.setIcon(
              L.divIcon({
                iconSize: [40, 40],
                iconAnchor: [10, 10],
                popupAnchor: [10, 0],
                shadowSize: [0, 0],
                className: `map-icon icon-animation map-icon_${r.id}`,
              }),
            )
          }
          dispatch(
            newTextAdded({
              id: `${r.id}${i}${start}${end}${Date.now()}`,
              text: `${r.label} ~ is playing ${note}${octave} for ${(
                end * 2
              ).toFixed(3)} beats`,
              class: `vehicle`,
            }),
          )
        }, start * 1000)

        const sweep = {
          volume,
          i,
          start,
          end,
          freq: noteFreq[octave][note],
          pan,
          adsr: adsr * end,
        }

        playSweep(sweep)
      })

      const endTime: number =
        (parseInt(routes[routes.length - 1].timestamp, 10) - batchStart) * 1000
      return endTime // when batch will be done
    },
    [countDown, dispatch, progression.index, volume],
  )

  const loadNewData = useCallback(
    (timer: any) => {
      if (timer) {
        timeout.current = setTimeout(() => {
          if (timeout.current) clearTimeout(timeout.current)
          ;(async () => {
            const url = chooseEnvEndpoint()
            const response = fetch(url).then((res) => res.json())
            try {
              const busEntities = cleanBusData(await response)
              markerRefs.length = 0

              dispatch(allBussesSet(busEntities))
              dispatch(freshRenderSet(false))
            } catch (err) {
              dispatch(
                newTextAdded({
                  id: `loading${Date.now()}`,
                  text: `Call failed.  Trying again.  loading...`,
                  class: `loading`,
                }),
              )
              loadNewData(4000)
              countDown(3000)
            }
          })()
        }, timer)
      } else {
        dispatch(freshRenderSet(true))
        allBussesSet([])
      }
    },
    [countDown, dispatch],
  )

  const beginPiece = useCallback(() => {
    loadNewData(1)
    dispatch(
      newTextAdded({
        id: `beginshortly${Date.now()}`,
        text: `loading... The piece will begin shortly. loading...`,
        class: `loading`,
      }),
    )
    signalTypeSet('interrupt')
  }, [dispatch, loadNewData])

  useEffect(() => {
    if (retiredBusses && retiredBusses.length > 0) {
      handleStaleVehicles(retiredBusses, progression.index)
    }
  }, [progression.index, retiredBusses])

  useEffect(() => {
    // 1st data load to get busses
    if (
      freshRender === null &&
      !pause &&
      (prevFreshRender === null || prevFreshRender === false)
    )
      beginPiece()
  }, [beginPiece, freshRender, pause, prevFreshRender])

  useEffect(() => {
    // testjpf, may be able to clean up conditionals with new slice logic
    if (
      updatedRoutes &&
      updatedRoutes.length > 0 &&
      prevBusses &&
      prevBusses.length > 0 &&
      !pause &&
      busses !== prevBusses &&
      prevFreshRender === false &&
      freshRender === false
    ) {
      // play music and get new data when batch completes
      loadNewData(makeMusicAndDance(updatedRoutes))
    } else if (prevFreshRender === null && freshRender === false) {
      // 2nd data load to calculate movement
      loadNewData(7000)
      countDown(7000)
    } else if (
      updatedRoutes &&
      updatedRoutes.length === 0 &&
      prevBusses &&
      prevBusses.length > 0 &&
      !pause &&
      busses !== prevBusses &&
      prevFreshRender === false &&
      freshRender === false
    ) {
      dispatch(
        newTextAdded({
          id: `loading${Date.now()}`,
          text: `No new updates.  Trying again.  loading...`,
          class: `loading`,
        }),
      )
      countDown(4000)
      loadNewData(4000)
    }

    if (signalType === 'stop') {
      // hard reset
      if (timeout && timeout.current) clearTimeout(timeout.current)
      resetAudioContext()
      signalTypeSet(null)
      if (!pause) signalTypeSet(null)
      dispatch(freshRenderSet(null))
    } else if (
      signalType === 'interrupt' &&
      !pause &&
      prevPause === true &&
      prevFreshRender !== null
    ) {
      // soft reset
      const timeElapsed: number =
        Math.floor(Date.now() / 1000) - parseInt(busses[0].timestamp, 10)
      if (timeElapsed > 50) {
        loadNewData(null)
      } else {
        loadNewData(4000)
        countDown(4000)
      }
    }
  }, [
    pause,
    loadNewData,
    busses,
    prevBusses,
    makeMusicAndDance,
    signalType,
    prevPause,
    freshRender,
    prevFreshRender,
    progression.index,
    countDown,
    dispatch,
    updatedRoutes,
  ])
  /** 
   * testjpf do preview and info
  const showBus = (place: Bus) => {
    setBusForPreview(place)
    togglePreview(true)
  }

  const showPreview = (place: Bus) => {
    if (isVisible) {
      togglePreview(false)
      setBusForPreview(null)
    }

    if (selectedBus?.id !== place.id) {
      setTimeout(() => {
        showBus(place)
      }, 400)
    }
  }
*/
  return (
    <div className="map__container">
      <MapContainer
        center={defaultPosition}
        zoom={11}
        scrollWheelZoom
        style={{ height: '100vh' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          url="https://api.mapbox.com/styles/v1/jfitzsimmons/ckvntg80w0gn014qc1s75efwr/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiamZpdHpzaW1tb25zIiwiYSI6ImNrdm50am1vcDNnMGEybnFmZHpzYzJodWEifQ.Y-mgO21RLeOtil5V_Fu7dA"
        />
        {busses &&
          busses.length > 0 &&
          busses.map((place: Bus) => (
            <BusMarker
              key={place.id}
              place={place}
              //  showPreview={showPreview}
              //  selectedBus={selectedBus}
            />
          ))}
      </MapContainer>
    </div>
  )
}
