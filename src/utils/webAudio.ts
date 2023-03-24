import { Octaves } from '../store/models'
import { rndmRng } from './calculations'

let audioContext = new window.AudioContext()

export function resetAudioContext() {
  audioContext.close()
  audioContext = new window.AudioContext()
}

export const progressions = [
  [
    ['F#', 'E', 'A', 'D'],
    ['A', 'E', 'B', 'C#'],
    ['E', 'B', 'F#', 'G#'],
    ['F#', 'C#', 'E', 'A'],
  ],
  [
    ['C', 'G', 'E', 'A'],
    ['F', 'A', 'C', 'E'],
    ['C', 'G', 'E', 'A'],
    ['G', 'B', 'D', 'F'],
  ],
  [
    ['D', 'F', 'G#', 'C'],
    ['D', 'F', 'G#', 'B'],
    ['C', 'D#', 'G', 'B'],
    ['C', 'D#', 'G', 'A'],
  ],
  [
    ['B', 'G', 'F#', 'D'],
    ['E', 'B', 'G', 'D'],
    ['E', 'C', 'B', 'G'],
    ['A', 'F#', 'C', 'D'],
  ],
  [
    ['A', 'E', 'C', 'G#'],
    ['E', 'B', 'G#', 'D'],
    ['G', 'D', 'B', 'F#'],
    ['D', 'A', 'C#', 'F#'],
  ],
  [
    ['B', 'F#', 'D', 'A'],
    ['F#', 'C#', 'A', 'E'],
    ['G', 'B', 'D', 'F#'],
    ['E', 'B', 'D', 'G'],
  ],
  [
    ['G#', 'C', 'D#', 'G'],
    ['A', 'D', 'A#', 'F'],
    ['G', 'A#', 'D', 'F'],
    ['G', 'A#', 'D', 'E'],
  ],
  [
    ['D#', 'G', 'A#', 'D'],
    ['D', 'F', 'A', 'C'],
    ['G', 'B', 'D', 'F#'],
    ['G', 'B', 'D', 'E'],
  ],
  [
    ['A', 'C', 'E', 'G'],
    ['F', 'G#', 'C', 'D#'],
    ['C', 'E', 'G', 'B'],
    ['G', 'B', 'D', 'F#'],
  ],
  [
    ['F#', 'A', 'C#', 'E'],
    ['E', 'G#', 'B', 'D#'],
    ['D', 'F#', 'A', 'C#'],
    ['C#', 'F', 'G#', 'B'],
  ],
] as const

export const noteFreq: Octaves = {
  1: {
    C: 32.70319566257482,
    'C#': 34.64782887210901,
    D: 36.70809598967594,
    'D#': 38.89087296526011,
    E: 41.20344461410874,
    F: 43.65352892912548,
    'F#': 46.24930283895429,
    G: 48.99942949771866,
    'G#': 51.91308719749314,
    A: 55.0,
    'A#': 58.27047018976123,
    B: 61.73541265701551,
  },
  2: {
    C: 65.4063913251496,
    'C#': 69.29565774421802,
    D: 73.41619197935189,
    'D#': 77.78174593052022,
    E: 82.40688922821748,
    F: 87.307057858250971,
    'F#': 92.49860567790859,
    G: 97.99885899543732,
    'G#': 103.82617439498628,
    A: 110.0,
    'A#': 116.54094037952247,
    B: 123.47082531403102,
  },
  3: {
    C: 130.81278265029931,
    'C#': 138.59131548843604,
    D: 146.8323839587037,
    'D#': 155.5634918610404,
    E: 164.81377845643496,
    F: 174.614115716501942,
    'F#': 184.9972113558172,
    G: 195.9977179908746,
    'G#': 207.65234878997256,
    A: 220.0,
    'A#': 233.0818807590449,
    B: 246.941650628062,
  },
  4: {
    C: 261.6255653005986,
    'C#': 277.182630976872,
    D: 293.6647679174075,
    'D#': 311.1269837220809,
    E: 329.62755691286992,
    F: 349.228231433003884,
    'F#': 369.9944227116343,
    G: 391.9954359817493,
    'G#': 415.30469757994513,
    A: 440.0,
    'A#': 466.1637615180899,
    B: 493.8833012561241,
  },
  5: {
    C: 523.2511306011972,
    'C#': 554.365261953744,
    D: 587.3295358348151,
    'D#': 622.2539674441618,
    E: 659.2551138257398,
    F: 698.4564628660077,
    'F#': 739.9888454232687,
    G: 783.9908719634985,
    'G#': 830.6093951598903,
    A: 880.0,
    'A#': 932.327523036179,
    B: 987.766602512248,
  },
  6: {
    C: 1046.5022612023945,
    'C#': 1108.7305239074883,
    D: 1174.65907166963,
    'D#': 1244.507934888323,
    E: 1318.5102276514797,
    F: 1396.9129257320155,
    'F#': 1479.977690846537,
    G: 1567.9817439269971,
    'G#': 1661.2187903197805,
    A: 1760.0,
    'A#': 1864.655046072359,
    B: 1975.533205024496,
  },
}

export function playChord(note: number, time: number) {
  const osc: OscillatorNode = audioContext.createOscillator()
  const gainNode: GainNode = audioContext.createGain()
  const biquadFilter: BiquadFilterNode = audioContext.createBiquadFilter()

  biquadFilter.type = 'bandpass'
  biquadFilter.Q.value = 9
  biquadFilter.frequency.setValueAtTime(190, audioContext.currentTime)

  osc.frequency.value = note

  gainNode.gain.cancelScheduledValues(audioContext.currentTime)
  gainNode.gain.setValueAtTime(0, audioContext.currentTime + time)
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + time)
  gainNode.gain.linearRampToValueAtTime(
    0.3,
    audioContext.currentTime + time + 2,
  )

  osc.connect(gainNode).connect(biquadFilter).connect(audioContext.destination)

  osc.start(audioContext.currentTime + time)
  osc.stop(audioContext.currentTime + time + 2)
}

export function playSweep(sweep: {
  volume: string
  freq: number
  start: number
  adsr: number
  end: any
  pan: number
}) {
  const osc: OscillatorNode = audioContext.createOscillator()
  const gainNode: GainNode = audioContext.createGain()
  const stereo: StereoPannerNode = audioContext.createStereoPanner()
  const biquadFilter: BiquadFilterNode = audioContext.createBiquadFilter()

  if (sweep.freq < 600) {
    const cut = (426 - Math.abs(sweep.freq - 175)) * 0.00065
    sweep.volume = (parseFloat(sweep.volume) - cut).toString()
    if (sweep.freq < 200 && sweep.freq > 175) {
      sweep.volume = (parseFloat(sweep.volume) * 0.3).toString()
    }
  }

  biquadFilter.type = 'bandpass'
  biquadFilter.Q.value = 9
  biquadFilter.frequency.setValueAtTime(190, audioContext.currentTime)

  osc.frequency.value = sweep.freq
  osc.detune.value = rndmRng(14, -14)

  gainNode.gain.cancelScheduledValues(audioContext.currentTime + sweep.start)
  gainNode.gain.setValueAtTime(0, audioContext.currentTime + sweep.start)
  gainNode.gain.linearRampToValueAtTime(
    parseFloat(sweep.volume),
    audioContext.currentTime + sweep.start + sweep.adsr,
  )
  gainNode.gain.linearRampToValueAtTime(
    0,
    audioContext.currentTime +
      sweep.start +
      sweep.end -
      (sweep.end - sweep.adsr) * 0.7,
  )

  stereo.pan.value = sweep.pan

  osc
    .connect(gainNode)
    .connect(biquadFilter)
    .connect(stereo)
    .connect(audioContext.destination)

  osc.start(audioContext.currentTime + sweep.start)
  osc.stop(audioContext.currentTime + sweep.start + sweep.end)
}
