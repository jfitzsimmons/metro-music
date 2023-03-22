import React, { useEffect, useCallback, useRef, createRef, memo } from 'react'
import { connect } from 'react-redux'
import L, { LatLngExpression } from 'leaflet'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import {
  setBusPreviewVisibility,
  setSelectedBus,
  setAllBusses,
  setNewText,
  setSignalType,
  setFreshRender,
} from '../../store/actions'
import { IState, Bus, TextCue } from '../../store/models'
import {
  playSweep,
  noteFreq,
  resetAudioContext,
  progressions,
  playChord,
} from '../../utils/webAudio'
import { countBy, distance, rndmRng } from '../../utils/calculations'
import { getAdsr, pickOctaveByLat, pickOctave } from '../../utils/waveShaping'
import { usePrevious, chooseEnvEndpoint } from '../../utils/tools'
import './Map.css'
import store from '../../store'

let retiredVehicles: Bus[] = []
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

const organizeBusses = (
  nextBusses: Bus[],
  pastBusses: Bus[],
  progression: number,
) => {
  let i2 = 0
  for (let i = 0; i < pastBusses.length; i++) {
    if (!nextBusses[i2]) return []
    if (
      pastBusses[i].id === nextBusses[i2].id ||
      nextBusses.some((b: Bus) => b.id === pastBusses[i].id)
    ) {
      // testjpf probably need to use a Bus class with methosd for setting properties
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
      retiredVehicles.push(pastBusses[i])
      i2--
    }

    if (nextBusses[i2 + 1]) i2++
  }

  function handleStaleVehicles(prog: number) {
    const currentProgress = Math.round(Date.now() / 1000) - concertStart
    const delay =
      currentProgress < 7
        ? 7 - currentProgress
        : 8 - ((currentProgress % 8) + 1)

    retiredVehicles.forEach((v, i) => {
      if (i < 4) {
        type OctaveKey = keyof typeof noteFreq
        const octave: OctaveKey = pickOctave(6 - i)
        const octaveNoteFreqs = noteFreq[octave]
        type NoteKey = keyof typeof octaveNoteFreqs
        const note: NoteKey = progressions[prog][3][Math.round(rndmRng(3, 0))]
        if (note) playChord(noteFreq[octave][note], delay)
      }
    })

    const amount = retiredVehicles.length

    setTimeout(
      () =>
        store.dispatch(
          setNewText({
            id: `retired${Date.now()}`,
            text: `${amount} ${
              amount === 1 ? 'bus is' : 'busses are'
            } without updates`,
            class: `retired`,
          }),
        ),
      delay * 1000,
    )

    retiredVehicles = []
  }

  if (retiredVehicles && retiredVehicles.length > 0)
    handleStaleVehicles(progression)

  const updatedRoutes = nextBusses
    .filter((vehicle: Bus) => vehicle && vehicle.distance !== 0)
    .sort(
      (x: Bus, y: Bus) => parseInt(x.timestamp, 10) - parseInt(y.timestamp, 10),
    )

  updatedRoutes.shift()

  return updatedRoutes
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

function Map({
  isVisible,
  busses,
  freshRender,
  flagRefresh,
  selectedBus,
  togglePreview,
  setBusForPreview,
  setNewBusMarkers,
  addToText,
  volume,
  pause,
  progression,
  signalType,
  setHalt,
}: any) {
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
            addToText({
              id: `countdown${Date.now()}`,
              text: `${i === 1000 ? 'updates in' : '...'} ${
                (timer - i) / 1000
              }`,
              class: `loading`,
            })
          }, i)
        }
      }
    },
    [addToText],
  )

  const makeMusicAndDance = useCallback(
    (routes: Bus[]) => {
      if (routes.length === 0 || !routes) {
        addToText({
          id: `loading${Date.now()}`,
          text: `No new updates.  Trying again.  loading...`,
          class: `loading`,
        })
        countDown(4000)
        return 4000
      }

      addToText({
        id: `newdata${Date.now()}`,
        text: `There are currently ${routes.length} busses making moves`,
        class: `newdata`,
      })

      let timestampDupes: any = {}
      timestampDupes = countBy(
        routes,
        (r: { timestamp: number }) => r.timestamp,
      )

      const batchStart = parseInt(
        routes.sort(
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
          addToText({
            id: `${r.id}${i}${start}${end}${Date.now()}`,
            text: `${r.label} ~ is playing ${note}${octave} for ${(
              end * 2
            ).toFixed(3)} beats`,
            class: `vehicle`,
          })
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
    [addToText, countDown, progression.index, volume],
  )

  const loadNewData = useCallback(
    (timer: any) => {
      if (timer) {
        if (timeout.current) clearTimeout(timeout.current)
        timeout.current = setTimeout(() => {
          ;(async function startCall() {
            const response = chooseEnvEndpoint()
            // console.log('loadNewData timer: ', timer)
            try {
              const busEntities = cleanBusData(await response)
              markerRefs.length = 0
              setNewBusMarkers(busEntities)
              flagRefresh(false)
            } catch (err) {
              addToText({
                id: `loading${Date.now()}`,
                text: `Call failed.  Trying again.  loading...`,
                class: `loading`,
              })
              loadNewData(3000)
              countDown(3000)
            }
          })()
        }, timer)
      } else {
        flagRefresh(true)
        setNewBusMarkers([])
      }
    },
    [addToText, countDown, flagRefresh, setNewBusMarkers],
  )

  const beginPiece = useCallback(() => {
    loadNewData(1)
    addToText({
      id: `beginshortly${Date.now()}`,
      text: `loading... The piece will begin shortly. loading...`,
      class: `loading`,
    })
    setHalt('interrupt')
  }, [addToText, loadNewData, setHalt])

  useEffect(() => {
    // console.log('// 1st data load to get busses')

    // 1st data load to get busses
    if (
      freshRender === null &&
      !pause &&
      (prevFreshRender === null || prevFreshRender === false)
    )
      beginPiece()
  }, [beginPiece, freshRender, pause, prevFreshRender])

  useEffect(() => {
    // console.log('prevFreshRender', prevFreshRender)
    //  console.log('prevPause', prevPause)
    if (
      prevBusses &&
      prevBusses.length > 0 &&
      !pause &&
      busses !== prevBusses &&
      prevFreshRender === false &&
      freshRender === false
    ) {
      // console.log('// play music and get new data when batch completes')

      // play music and get new data when batch completes
      const newRoutes = organizeBusses(busses, prevBusses, progression.index)
      loadNewData(makeMusicAndDance(newRoutes))
    } else if (prevFreshRender === null && freshRender === false) {
      // 2nd data load to calculate movement
      // console.log(' // 2nd data load to calculate movement')
      loadNewData(7000)
      countDown(7000)
    }

    if (signalType === 'stop') {
      // hard reset
      if (timeout && timeout.current) clearTimeout(timeout.current)
      resetAudioContext()
      setHalt(null)
      if (!pause) setHalt(null)
      flagRefresh(null)
    } else if (
      signalType === 'interrupt' &&
      !pause &&
      prevPause === true &&
      prevFreshRender !== null
    ) {
      // soft reset
      // console.log('//soft reset//soft reset//soft reset')

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
    setHalt,
    freshRender,
    prevFreshRender,
    progression.index,
    flagRefresh,
    countDown,
  ])

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
              showPreview={showPreview}
              selectedBus={selectedBus}
            />
          ))}
      </MapContainer>
    </div>
  )
}

const mapStateToProps = (state: IState) => {
  const { busses, controls } = state
  return {
    isVisible: busses.placePreviewsIsVisible,
    busses: busses.busses,
    selectedBus: busses.selectedBus,
    volume: controls.volume,
    pause: controls.pause,
    progression: controls.progression,
    signalType: controls.signalType,
    freshRender: controls.freshRender,
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  togglePreview: (payload: boolean) =>
    dispatch(setBusPreviewVisibility(payload)),
  setBusForPreview: (payload: Bus) => dispatch(setSelectedBus(payload)),
  setNewBusMarkers: (payload: Bus[]) => dispatch(setAllBusses(payload)),
  addToText: (payload: TextCue) => dispatch(setNewText(payload)),
  setHalt: (payload: string) => dispatch(setSignalType(payload)),
  flagRefresh: (payload: boolean) => dispatch(setFreshRender(payload)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Map)
