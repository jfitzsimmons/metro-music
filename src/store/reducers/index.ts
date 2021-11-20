import { combineReducers } from "redux";
import places from "./places";
import search from "./search";
import controls from "./controls";

export default combineReducers({ places, search, controls });
