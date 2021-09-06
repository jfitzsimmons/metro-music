import { LatLngExpression } from "leaflet";

export interface SearchState {
  searchIsVisible: boolean;
}

export interface PlaceState {
  places: Entity[];
  selectedPlace: Entity | null;
  placePreviewsIsVisible: boolean;
  placeFormIsVisible: boolean;
  prePlacePosition: LatLngExpression;
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