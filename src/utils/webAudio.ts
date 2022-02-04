import { Octaves } from '../store/models';
import { rndmRng } from './calculations';

let audioContext = new (window.AudioContext)();

export function resetAudioContext() {
  audioContext.close();
  audioContext = new (window.AudioContext)();
}

export const noteFreq:Octaves = {
  1: {
    "C": 32.703195662574829,
    "C#": 34.647828872109012,
    "D": 36.708095989675945,
    "D#": 38.890872965260113,
    "E": 41.203444614108741,
    "F": 43.653528929125485,
    "F#": 46.249302838954299,
    "G": 48.999429497718661,
    "G#": 51.913087197493142,
    "A": 55.000000000000000,
    "A#": 58.270470189761239,
    "B": 61.735412657015513,
  },
  2: {
    "C": 65.406391325149658,
    "C#": 69.295657744218024,
    "D": 73.416191979351890,
    "D#": 77.781745930520227,
    "E": 82.406889228217482,
    "F": 87.307057858250971,
    "F#": 92.498605677908599,
    "G": 97.998858995437323,
    "G#": 103.826174394986284,
    "A": 110.000000000000000,
    "A#": 116.540940379522479,
    "B": 123.470825314031027,
  },
  3:{
    "C": 130.812782650299317,
    "C#": 138.591315488436048,
    "D": 146.832383958703780,
    "D#": 155.563491861040455,
    "E": 164.813778456434964,
    "F": 174.614115716501942,
    "F#": 184.997211355817199,
    "G": 195.997717990874647,
    "G#": 207.652348789972569,
    "A": 220.000000000000000,
    "A#": 233.081880759044958,
    "B": 246.941650628062055,
  },
  4:{
    "C": 261.625565300598634,
    "C#": 277.182630976872096,
    "D": 293.664767917407560,
    "D#": 311.126983722080910,
    "E": 329.627556912869929,
    "F": 349.228231433003884,
    "F#": 369.994422711634398,
    "G": 391.995435981749294,
    "G#": 415.304697579945138,
    "A": 440.000000000000000,
    "A#": 466.163761518089916,
    "B": 493.883301256124111,
  },
  5: {
    "C": 523.251130601197269,
    "C#": 554.365261953744192,
    "D": 587.329535834815120,
    "D#": 622.253967444161821,
    "E": 659.255113825739859,
    "F": 698.456462866007768,
    "F#": 739.988845423268797,
    "G": 783.990871963498588,
    "G#": 830.609395159890277,
    "A": 880.000000000000000,
    "A#": 932.327523036179832,
    "B": 987.766602512248223,
  },
  6: {
    "C": 1046.502261202394538,
    "C#": 1108.730523907488384,
    "D": 1174.659071669630241,
    "D#": 1244.507934888323642,
    "E": 1318.510227651479718,
    "F": 1396.912925732015537,
    "F#": 1479.977690846537595,
    "G": 1567.981743926997176,
    "G#": 1661.218790319780554,
    "A": 1760.000000000000000,
    "A#": 1864.655046072359665,
    "B": 1975.533205024496447,
  }
}

export function playSweep(sweep: {volume: string; freq: number; start: number; adsr: number; end: any; pan: number; }) {
  let osc: OscillatorNode = audioContext.createOscillator();
  let gainNode: GainNode = audioContext.createGain();
  let stereo: StereoPannerNode = audioContext.createStereoPanner();
  let biquadFilter: BiquadFilterNode = audioContext.createBiquadFilter();
  gainNode.gain.value = parseFloat(sweep.volume)
  biquadFilter.type = "lowpass";
  biquadFilter.frequency.setValueAtTime(600, audioContext.currentTime);
  osc.frequency.value = sweep.freq;
  osc.detune.value = rndmRng(14,-14);
  gainNode.gain.cancelScheduledValues(audioContext.currentTime + sweep.start);
  gainNode.gain.setValueAtTime(0, audioContext.currentTime + sweep.start);
  gainNode.gain.linearRampToValueAtTime(parseFloat(sweep.volume), audioContext.currentTime + sweep.start + sweep.adsr);

  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + sweep.start + sweep.end - (sweep.end - sweep.adsr)*.7);
  stereo.pan.value = sweep.pan;

  osc.connect(gainNode).connect(biquadFilter).connect(stereo).connect(audioContext.destination);

  osc.start(audioContext.currentTime + sweep.start);
  osc.stop(audioContext.currentTime + sweep.start + sweep.end);
}