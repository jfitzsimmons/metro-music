//TESTJPF needs a style lift
import React, { ChangeEvent } from 'react'
import { connect } from 'react-redux'
import {
  chooseProgression,
  pauseOrchestra,
  setSignalType,
  setNewText,
  setScoreVisibility,
  setVolume,
} from '../../store/actions'
import { IState, Progression, TextCue } from '../../store/models'
import './Controls.css'
import { GiMusicalScore } from 'react-icons/gi'

import { debounce } from '../../utils/tools'
import {
  ImVolumeMedium,
  ImVolumeLow,
  ImVolumeHigh,
  ImVolumeMute,
} from 'react-icons/im'
import { BiArrowToLeft, BiArrowToRight } from 'react-icons/bi'
import { BsFillPlayFill, BsPauseFill, BsStopFill } from 'react-icons/bs'
import { ReactComponent as MetroIcon } from '../../assets/svg/metro.svg'

const datenow = new Date()

const Controls = ({
  setScoreVisibility,
  volume,
  setVolume,
  chooseProgression,
  pause,
  pauseOrchestra,
  scoreIsVisible,
  addToText,
  setSignalType, // testjpf overengineered.  just kill processes? have a countdown to when it'll be over!
}: any) => {
  const delayText = debounce(() => {
    //testjpf loop trhough existing calls and update volume property????

    addToText({
      id: `volume${Date.now()}`,
      text: `Volume will be set to ${Math.round(
        parseFloat(volume) * 100,
      )}% with the next batch of data.`,
      class: `controls-change`,
    })
  }, 500)

  function handleVolume(event: ChangeEvent<HTMLInputElement>) {
    if (event.target) {
      const value = event.target.value.toString()
      setVolume(value)
    }
  }

  function handleProgression(event: ChangeEvent<HTMLSelectElement>) {
    if (event.target) {
      const { options, selectedIndex } = event.target
      const index = event.target.value.toString()
      const label = options[selectedIndex].text
      chooseProgression({ label, index })
      addToText({
        id: `progression${Date.now()}`,
        text: `${label} will start playing with the next batch of data.`,
        class: `controls-change`,
      })
    }
  }

  function returnVolumeIcon(percent: number) {
    if (percent < 80 && percent > 30) {
      return <ImVolumeMedium />
    } else if (percent >= 80) {
      return <ImVolumeHigh />
    } else if (percent === 0) {
      return <ImVolumeMute />
    }
    return <ImVolumeLow />
  }

  function handlePlayback() {
    pauseOrchestra(pause === true ? false : true)
    addToText({
      id: `playback${Date.now()}`,
      text: `The piece will ${
        pause === false
          ? 'stop after this batch of data.'
          : 'begin again shortly.'
      } `,
      class: `controls-change`,
    })
  }

  return (
    <div
      className={`header__container header__container--${
        scoreIsVisible && 'active'
      }`}
    >
      <div
        className={`score-toggle ${scoreIsVisible ? 'unflipped' : 'flipped'}`}
      >
        {scoreIsVisible ? (
          <BiArrowToLeft
            onClick={() => setScoreVisibility(scoreIsVisible ? false : true)}
          />
        ) : (
          <BiArrowToRight
            onClick={() => setScoreVisibility(scoreIsVisible ? false : true)}
          />
        )}
        <GiMusicalScore
          onClick={() => setScoreVisibility(scoreIsVisible ? false : true)}
        ></GiMusicalScore>
      </div>
      <div className="controls">
        <div className="controls__buttons">
          <button
            className={pause === true ? 'play' : 'pause'}
            onMouseUp={handlePlayback}
          >
            {pause === true ? <BsFillPlayFill /> : <BsPauseFill />}
          </button>

          <button
            className="controls__buttons-stop"
            onMouseUp={() => setSignalType('stop')}
          >
            <BsStopFill />
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
            background: `hsla(209, ${Math.round(volume * 100)}%, 20%, .4)`,
          }}
        >
          <div className="volume__amount">
            {returnVolumeIcon(Math.round(volume * 100))}
            {Math.round(volume * 100)}%
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

const mapStateToProps = (state: IState) => {
  const { score, controls } = state
  return {
    scoreIsVisible: score.scoreIsVisible,
    volume: controls.volume,
    pause: controls.pause,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    setScoreVisibility: (payload: boolean) =>
      dispatch(setScoreVisibility(payload)),
    setVolume: (payload: string) => dispatch(setVolume(payload)),
    pauseOrchestra: (payload: boolean) => dispatch(pauseOrchestra(payload)),
    chooseProgression: (payload: Progression) =>
      dispatch(chooseProgression(payload)),
    setSignalType: (payload: string) => dispatch(setSignalType(payload)),
    addToText: (payload: TextCue) => dispatch(setNewText(payload)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls)
