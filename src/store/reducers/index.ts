import { combineReducers } from 'redux'
import busses from './busses'
import score from './score'
import controls from './controls'

export default combineReducers({ busses, score, controls })
