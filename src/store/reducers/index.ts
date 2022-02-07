import { combineReducers } from "redux";
import places from "./places";
import score from "./score";
import controls from "./controls";

export default combineReducers({ places, score, controls });