import { LatLngExpression } from "leaflet";

export interface SearchState {
  searchIsVisible: boolean;
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
  search: SearchState;
  places: PlaceState;
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
  ​​​​​  startDate: string;
  ​​​​​  startTime: string;
  ​​​​  tripId: string;
  };
  vehicle: {
    id: string;
    label: string;
  }
}