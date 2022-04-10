import { Bus } from "../models";

export const SET_ALL_BUSSES = "SET_ALL_BUSSES";
export const SET_SELECTED_BUS = "SET_SELECTED_BUS";
export const SET_BUS_PREVIEW_VISIBILITY = "SET_BUS_PREVIEW_VISIBILITY";

export const setAllBusses = (busses: Bus[]) => ({
  type: SET_ALL_BUSSES,
  payload: busses
});

export const setSelectedBus = (place: Bus) => ({
  type: SET_SELECTED_BUS,
  payload: place,
});

export const setBusPreviewVisibility = (show: boolean) => ({
  type: SET_BUS_PREVIEW_VISIBILITY,
  payload: show,
});