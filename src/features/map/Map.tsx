import React, { useEffect, useCallback, useRef, createRef, memo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'
import { Bus } from '../../store/models'
import {
  playSweep,
  noteFreq,
  resetAudioContext,
  progressions,
} from '../../utils/webAudio'
import { countBy, rndmRng } from '../../utils/calculations'
import { getAdsr, pickOctaveByLat } from '../../utils/waveShaping'
import { usePrevious, chooseEnvEndpoint } from '../../utils/tools'
import './map.css'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { allBussesSet, selectedBusSet } from '../busses/bussesSlice'
import { newTextAdded } from '../score/scoreSlice'
import { freshRenderSet, signalTypeSet } from '../controls/controlsSlice'
import { markerRefs, findMarker, textMarkerTimeouts, getChord } from './utils'
import {
  cleanBusData,
  handleStaleVehicles,
  playStationaryBusses,
} from '../busses/utils'

let longAvg = -90.28392791748047
let chord = 0
let start = 0
let concertStart = 0

const BusMarker = memo(({ place, selectedBus }: any) => {
  const dispatch = useAppDispatch()

  const newRef = createRef<L.Marker>()
  markerRefs.push(newRef)
  return (
    <Marker
      key={place.id}
      position={[place.latitude, place.longitude]}
      eventHandlers={{ click: () => dispatch(selectedBusSet(place)) }}
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

function RecenterAutomatically({ lat, lng }: any) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng])
  }, [lat, lng, map])
  return null
}

export default function Map() {
  const dispatch = useAppDispatch()
  const {
    busses,
    retiredBusses,
    updatedRoutes,
    stationaryBusses,
    defaultPosition,
  } = useAppSelector((state) => state.busses)
  const { volume, pause, signalType, freshRender, progression } =
    useAppSelector((state) => state.controls)
  const timeout: { current: NodeJS.Timeout | null } = useRef(null)
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
          text: `There are currently ${routes.length} busses making music`,
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
      chord = getChord(parseInt(routes[0].timestamp, 10) - concertStart)

      if (retiredBusses.length > 0)
        handleStaleVehicles(retiredBusses, progression.index, chord)
      if (stationaryBusses.length > 0)
        playStationaryBusses(stationaryBusses, progression.index, chord)

      routes.forEach((r: Bus, i: number) => {
        type OctaveKey = keyof typeof noteFreq
        const octave: OctaveKey = pickOctaveByLat(r.latitude)
        const octaveNoteFreqs = noteFreq[octave]
        type NoteKey = keyof typeof octaveNoteFreqs
        const note: NoteKey =
          progressions[progression.index][chord][Math.round(rndmRng(3, 0))] // Ex: C#

        chord = getChord(parseInt(r.timestamp, 10) - concertStart)
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
        if (r && r.distance) end = r.distance < 0.05 ? 0.05 : r.distance
        end = end * 10 > 4 ? 4 : end * 10
        const adsr = r && r.mph ? getAdsr(r.mph) : 0
        if (r.latitude > 38.66) longAvg = -90.3517098
        const pan =
          (Math.abs(longAvg) - Math.abs(r.longitude)) * 6 * (octave * 0.15)
        const found = findMarker(r.id)

        textMarkerTimeouts.push(
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
          }, start * 1000),
        )

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
        (parseInt(routes[routes.length - 1].timestamp, 10) - batchStart + 0.3) *
        1000
      return endTime // when batch will be done
    },
    [
      countDown,
      dispatch,
      progression.index,
      retiredBusses,
      stationaryBusses,
      volume,
    ],
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
        dispatch(freshRenderSet(null))
        dispatch(allBussesSet([]))
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
    dispatch(signalTypeSet('interrupt'))
  }, [dispatch, loadNewData])

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
    if (
      updatedRoutes &&
      updatedRoutes.length > 0 &&
      busses !== prevBusses &&
      prevBusses &&
      prevBusses.length > 0 &&
      !pause &&
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
      busses !== prevBusses &&
      prevBusses &&
      prevBusses.length > 0 &&
      !pause &&
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
      for (let i = textMarkerTimeouts.length; i--; ) {
        clearTimeout(textMarkerTimeouts[i])
      }
      dispatch(signalTypeSet(null))
      dispatch(freshRenderSet(null))
    } else if (
      signalType === 'interrupt' &&
      pause === false &&
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

  return (
    <div className="map__container">
      <MapContainer
        center={[38.65727, -90.29789]}
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
            />
          ))}
        {retiredBusses &&
          retiredBusses.length > 0 &&
          retiredBusses.map((place: Bus) => (
            <BusMarker
              key={place.id}
              place={place}
            />
          ))}
        <RecenterAutomatically
          lat={defaultPosition[0]}
          lng={defaultPosition[1]}
        />
      </MapContainer>
    </div>
  )
}
