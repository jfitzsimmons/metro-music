import { Bus } from 'store/models'
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
    start * 2 * 1000,
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

  playArp(arpnotes, 8, amount)

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
    8000,
  )
}
