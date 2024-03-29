import React, { ChangeEvent, useEffect } from 'react'
import './controls.css'
import {
  ImVolumeMedium,
  ImVolumeLow,
  ImVolumeHigh,
  ImVolumeMute,
} from 'react-icons/im'
import { GiMusicalScore } from 'react-icons/gi'
import { BiArrowToLeft } from 'react-icons/bi'
import { BsFillPlayFill, BsPauseFill, BsStopFill, BsInfo } from 'react-icons/bs'
import { useAppSelector, useAppDispatch } from '../../store/hooks'

import { ReactComponent as MetroIcon } from '../../assets/svg/metro.svg'
import { debounce } from '../../utils/tools'
import { newTextAdded, scoreVisibilitySet } from '../score/scoreSlice'
import { busVisibilitySet } from '../busses/bussesSlice'
import {
  volumeSet,
  progressionChosen,
  orchestraPaused,
  signalTypeSet,
  showInfoSet,
} from './controlsSlice'

const datenow = new Date()

export default function Controls() {
  const dispatch = useAppDispatch()
  const { volume, pause, signalType } = useAppSelector(
    (state) => state.controls,
  )
  const { scoreIsVisible } = useAppSelector((state) => state.score)

  const delayText = debounce(() => {
    dispatch(
      newTextAdded({
        id: `volume${Date.now()}`,
        text: `Volume will be set to ${Math.round(
          parseFloat(volume) * 100,
        )}% with the next batch of data.`,
        class: `controls-change`,
      }),
    )
  }, 500)

  function handleVolume(event: ChangeEvent<HTMLInputElement>) {
    if (event.target) {
      const value = event.target.value.toString()
      dispatch(volumeSet(value))
    }
  }

  function handleProgression(event: ChangeEvent<HTMLSelectElement>) {
    if (event.target) {
      const { options, selectedIndex } = event.target
      const index = event.target.value.toString()
      const label = options[selectedIndex].text
      dispatch(progressionChosen({ label, index }))
      dispatch(
        newTextAdded({
          id: `progression${Date.now()}`,
          text: `${label} will start playing with the next batch of data.`,
          class: `controls-change`,
        }),
      )
    }
  }

  function returnVolumeIcon(percent: number) {
    if (percent < 80 && percent > 30) {
      return <ImVolumeMedium />
    }
    if (percent >= 80) {
      return <ImVolumeHigh />
    }
    if (percent === 0) {
      return <ImVolumeMute />
    }
    return <ImVolumeLow />
  }

  function handlePlayback() {
    dispatch(orchestraPaused(pause !== true))
    dispatch(
      newTextAdded({
        id: `playback${Date.now()}`,
        text: `The piece will ${
          pause === false
            ? 'stop after this batch of data.'
            : 'begin again shortly.'
        } `,
        class: `controls-change`,
      }),
    )
  }

  function showInfo() {
    dispatch(showInfoSet(true))
    dispatch(busVisibilitySet(true))
  }

  useEffect(() => {
    if (signalType === 'stop' && pause === false)
      dispatch(orchestraPaused(true))
  }, [dispatch, pause, signalType])

  return (
    <div
      className={`header__container header__container--${
        scoreIsVisible && 'active'
      }`}
    >
      <button
        className="score-button"
        type="button"
        onClick={() => dispatch(scoreVisibilitySet())}
      >
        <div
          className={`score-toggle ${scoreIsVisible ? 'unflipped' : 'flipped'}`}
        >
          <BiArrowToLeft />
          <GiMusicalScore />
        </div>
      </button>
      <div className="controls">
        <div className="controls__buttons">
          <button
            type="button"
            className={pause === true ? 'play' : 'pause'}
            onMouseUp={handlePlayback}
          >
            {pause === true ? <BsFillPlayFill /> : <BsPauseFill />}
          </button>

          <button
            type="button"
            className="controls__buttons-stop"
            onMouseUp={() => dispatch(signalTypeSet('stop'))}
          >
            <BsStopFill />
          </button>
          <button
            type="button"
            className="controls__buttons-info"
            onMouseUp={() => showInfo()}
          >
            <BsInfo />
          </button>
        </div>
        <div className="select-div song">
          <div className="song__select">
            <div className="song__icon_select">
              <MetroIcon className="metro_icon" />
              <div className="select_wrapper">
                <select onChange={handleProgression}>
                  <option value={0}>IV-I-V-vi in A Major</option>
                  <option value={1}>I-IV-V in C Major</option>
                  <option value={2}>ii-V-I in C Minor</option>
                  <option value={3}>I-vi-IV-V in G Major</option>
                  <option value={4}>I-V-♭VII-IV in A Major</option>
                  <option value={5}>vi-iii-IV-ii in D Major</option>
                  <option value={6}>IV-V-iii in E♭ Major</option>
                  <option value={7}>IV-iii-VI in G♭ Major</option>
                  <option value={8}>i-♭VI-♭III-♭VII A Minor</option>
                  <option value={9}>i-♭VII-♭VI-V7 F# Minor</option>
                </select>
              </div>
            </div>
            <div className="song__info">
              St. Louis Metro Bus Drivers - {datenow.toDateString()}
            </div>
          </div>
        </div>
        <div
          className="volume"
          style={{
            background: `hsla(209, ${Math.round(
              parseFloat(volume) * 100,
            )}%, 20%, .4)`,
          }}
        >
          <div className="volume__amount">
            {returnVolumeIcon(Math.round(parseFloat(volume) * 100))}
            {Math.round(parseFloat(volume) * 100)}%
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.025"
            value={volume}
            list="volumes"
            name="volume"
            onChange={(e) => handleVolume(e)}
            onMouseUp={delayText}
          />
          <datalist id="volumes">
            <option
              value="0.0"
              label="Mute"
            />
            <option
              value="1.0"
              label="100%"
            />
          </datalist>
        </div>
      </div>
    </div>
  )
}
