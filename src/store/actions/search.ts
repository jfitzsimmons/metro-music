export const SET_SEARCH_VISIBILITY = "SET_SEARCH_VISIBILITY";
export const SET_SWEEP_TIME = "SET_SWEEP_TIME";

export const setSearchVisibility = (show: boolean) => ({
  type: SET_SEARCH_VISIBILITY,
  payload: show,
});
export const setSweepTime = (sweepTime: number) => ({
  type: SET_SWEEP_TIME,
  payload: sweepTime,
});
