import { TextCue } from "../models";

export const SET_SCORE_VISIBILITY = "SET_SCORE_VISIBILITY";
export const SET_SWEEP_TIME = "SET_SWEEP_TIME";
export const SET_NEW_TEXT = "SET_NEW_TEXT";

export const setScoreVisibility = (show: boolean) => ({
  type: SET_SCORE_VISIBILITY,
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
