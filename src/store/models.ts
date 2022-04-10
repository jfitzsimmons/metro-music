export interface ControlState {
  volume: string;
  pause: boolean;
  progression: Progression;
  changeType: string;
  freshRender: boolean;
}

export interface Progression {
  label: string;
  index: number;
}

export interface Routes {
  updatedRoutes: Bus[] | null;
  retiredVehicles: Bus[] | null;
}

export interface scoreState {
  scoreIsVisible: boolean;
  sweepTime: number;
  textCues: TextCue[];
}

export interface TextCue {
  id: string;
  text: string;
  class?: string
}

export interface IBusState {
  busses: Bus[];
  selectedBus: Bus | null;
  placePreviewsIsVisible: boolean;
}

export type BusState  = IBusState;

export interface IState {
  score: scoreState;
  busses: BusState;
  controls: ControlState;
}

export interface Bus {
    id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    label: string;
    distance?: number;
    mph?: number;
    timing?: number;
}

export interface Octaves {
  1: Scale;
  2: Scale;
  3: Scale;
  4: Scale;
  5: Scale;
  6: Scale;
}

export interface Scale {
  "C": number,
  "C#": number,
  "D": number,
  "D#": number,
  "E": number,
  "F": number,
  "F#": number,
  "G": number,
  "G#":number,
  "A": number,
  "A#": number,
  "B": number,
}