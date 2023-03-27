import { Bus } from 'store/models'
import L from 'leaflet'
import {
  noteFreq,
  progressions,
  playChord,
  playArp,
} from '../../utils/webAudio'
import { rndmRng } from '../../utils/calculations'
import { pickOctave } from '../../utils/waveShaping'
import { newTextAdded } from '../score/scoreSlice'
import store from '../../store/store'
import { findMarker, textMarkerTimeouts } from '../map/utils'

export function cleanBusData(entities: any) {
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

export function handleStaleVehicles(
  noMoves: Bus[],
  prog: number,
  chord: number,
) {
  const start = Math.abs(chord - 3)

  noMoves.forEach((v, i) => {
    if (i < 4) {
      type OctaveKey = keyof typeof noteFreq
      const octave: OctaveKey = pickOctave(6 - i)
      const octaveNoteFreqs = noteFreq[octave]
      type NoteKey = keyof typeof octaveNoteFreqs
      const note: NoteKey = progressions[prog][3][Math.round(rndmRng(3, 0))]
      if (note) playChord(noteFreq[octave][note], start * 2)
    }
    const found = findMarker(v.id)
    if (found && found.current)
      textMarkerTimeouts.push(
        setTimeout(() => {
          found.current!.setIcon(
            L.divIcon({
              iconSize: [40, 40],
              iconAnchor: [10, 10],
              popupAnchor: [10, 0],
              shadowSize: [0, 0],
              className: `map-icon icon-animation2 map-icon_${v.id}`,
            }),
          )
        }, start * 2 * 1010),
      )
  })

  textMarkerTimeouts.push(
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
      start * 2 * 1000,
    ),
  )
}

export function playStationaryBusses(
  noMoves: Bus[],
  prog: number,
  chord: number,
) {
  const arpnotes: string[] = progressions[prog][chord].slice()
  const amount =
    Math.round(noMoves.length / 10) > 4 ? 4 : Math.round(noMoves.length / 10)

  noMoves.forEach((b: Bus) => {
    const found = findMarker(b.id)
    if (found && found.current) {
      textMarkerTimeouts.push(
        setTimeout(() => {
          found.current!.setIcon(
            L.divIcon({
              iconSize: [40, 40],
              iconAnchor: [10, 10],
              popupAnchor: [10, 0],
              shadowSize: [0, 0],
              className: `map-icon icon-animation3 map-icon_${b.id}`,
            }),
          )
        }, 8100 + Math.round(rndmRng(800, -200))),
      )
    }
  })

  playArp(arpnotes, 8, amount)

  textMarkerTimeouts.push(
    setTimeout(
      () =>
        store.dispatch(
          newTextAdded({
            id: `stationary${Date.now()}`,
            text: `${noMoves.length} ${
              noMoves.length === 1 ? 'bus has' : 'busses have'
            } not moved`,
            class: `retired`,
          }),
        ),
      8300,
    ),
  )
}
