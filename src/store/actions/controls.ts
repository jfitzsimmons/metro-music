import { Progression } from "../models";

export const SET_VOLUME = "SET_VOLUME";
export const PAUSE_ORCHESTRA = "PAUSE_ORCHESTRA";
export const CHOOSE_PROGRESSION = "CHOOSE_PROGRESSION";
export const SET_CHANGE_TYPE = "SET_CHANGE_TYPE";
export const SET_FRESH_RENDER = "SET_FRESH_RENDER"

export const setVolume = (volume: string) => ({
  type: SET_VOLUME,
  payload: volume,
});
export const pauseOrchestra = (pause: boolean) => ({
  type: PAUSE_ORCHESTRA,
  payload: pause,
});
export const chooseProgression = (progression: Progression) => ({
  type: CHOOSE_PROGRESSION,
  payload: progression,
});
export const setChangeType = (changeType: string) => ({
  type: SET_CHANGE_TYPE,
  payload: changeType,
});
export const setFreshRender = (freshRender: boolean) => ({
  type: SET_FRESH_RENDER,
  payload: freshRender,
});