import { TextCue } from "../models";

export const SET_SEARCH_VISIBILITY = "SET_SEARCH_VISIBILITY";
export const SET_SWEEP_TIME = "SET_SWEEP_TIME";
export const SET_NEW_TEXT = "SET_NEW_TEXT";

export const setSearchVisibility = (show: boolean) => ({
  type: SET_SEARCH_VISIBILITY,
  payload: show,
});
export const setSweepTime = (sweepTime: number) => ({
  type: SET_SWEEP_TIME,
  payload: sweepTime,
});
export const setNewText = (textCue: TextCue) => ({
  type: SET_NEW_TEXT,
  payload: textCue,
});
