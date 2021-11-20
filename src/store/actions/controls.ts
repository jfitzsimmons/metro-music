export const SET_VOLUME = "SET_VOLUME";
export const PAUSE_ORCHESTRA = "PAUSE_ORCHESTRA";

export const setVolume = (volume: string) => ({
  type: SET_VOLUME,
  payload: volume,
});
export const pauseOrchestra = (pause: boolean) => ({
  type: PAUSE_ORCHESTRA,
  payload: pause,
});
