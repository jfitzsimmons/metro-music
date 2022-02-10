import { LatLngExpression } from "leaflet";

export interface ControlState {
  volume: string;
  pause: boolean;
  progression: Progression;
  changeType: string;
}

export interface Progression {
  label: string;
  index: number;
}

export interface Routes {
  updatedRoutes: Entity[] | null;
  retiredVehicles: Entity[] | null;
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

export interface PlaceState {
  places: Entity[];
  pastPlaces: Entity[];
  selectedPlace: Entity | null;
  placePreviewsIsVisible: boolean;
  placeFormIsVisible: boolean;
  prePlacePosition: LatLngExpression;
  initial: boolean;
}

export interface IState {
  score: scoreState;
  places: PlaceState;
  controls: ControlState;
}

export interface Place {
  picture?: string;
  title?: string;
  description?: string;
  seeMoreLink?: string;
  position: LatLngExpression;
}

export interface Entity {
  id: string;
  vehicle: Vehicle;
  movement?: Movement;
}

export interface Movement {
  distance?: number;
  mph?: number;
  timing?: number;
}

export interface Vehicle {
  position: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  trip: {
    routeId: string;
    startDate: string;
    startTime: string;
    tripId: string;
  };
  vehicle: {
    id: string;
    label: string;
  }
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