import React from 'react'
import { playSweep } from 'utils/webAudio'
import { AiFillCloseCircle } from 'react-icons/ai'
import { newTextAdded } from 'features/score/scoreSlice'
import { findMarker } from 'features/map/utils'
import L from 'leaflet'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import {
  busVisibilitySet,
  defaultMapPositionSet,
  selectedBusSet,
} from '../busses/bussesSlice'
import { showInfoSet } from '../controls/controlsSlice'

import './info.css'

export default function Info() {
  const dispatch = useAppDispatch()
  const { volume, showInfo } = useAppSelector((state) => state.controls)
  const { busIsVisible, selectedBus } = useAppSelector((state) => state.busses)
  const sweep = () => {
    const found = findMarker('6713')
    if (found && found.current) {
      found.current.setIcon(
        L.divIcon({
          iconSize: [40, 40],
          iconAnchor: [10, 10],
          popupAnchor: [10, 0],
          shadowSize: [0, 0],
          className: `map-icon icon-animation map-icon_6713`,
        }),
      )
    }
    dispatch(
      newTextAdded({
        id: `671300${Date.now()}`,
        text: `98 Ballas-North Hanley - SOUTH ~ is playing F#4 for 1.45 beats`,
        class: `vehicle`,
      }),
    )
    setTimeout(() => {
      if (found && found.current) {
        found.current.setIcon(
          L.divIcon({
            iconSize: [40, 40],
            iconAnchor: [10, 10],
            popupAnchor: [10, 0],
            shadowSize: [0, 0],
            className: `map-icon map-icon_6713`,
          }),
        )
      }
    }, 1450)

    return {
      volume,
      i: 0,
      start: 0,
      end: 1.45,
      freq: 369.9944227116343,
      pan: -1.33,
      adsr: 0.001 * 1.45,
    }
  }

  function closePane() {
    dispatch(busVisibilitySet(false))
    dispatch(showInfoSet(false))
    dispatch(selectedBusSet(null))
  }
  return (
    <div
      className={`preview__container preview__container--${
        busIsVisible && 'active'
      } ${showInfo === false && 'top-space'}`}
    >
      <button
        type="button"
        className="preview__close"
        onClick={() => closePane()}
      >
        <AiFillCloseCircle />
      </button>
      {selectedBus && (
        <div className="preview__description__container">
          <div className="preview__title">{selectedBus?.label}</div>
          <div className="preview__description">
            <ul>
              <li>
                <span className="bold">Latitude:</span> {selectedBus?.latitude}
              </li>
              <li>
                <span className="bold">Longitude:</span>{' '}
                {selectedBus?.longitude}
              </li>
              <li>
                <span className="bold">Timestamp:</span>{' '}
                {new Date(
                  parseInt(selectedBus.timestamp, 10) * 1000,
                ).toDateString()}{' '}
                |{' '}
                {new Date(
                  parseInt(selectedBus.timestamp, 10) * 1000,
                ).toTimeString()}
              </li>
              <li>
                <span className="bold">Vehicle ID:</span> {selectedBus?.id}
              </li>
              <li>
                <span className="bold">Distance:</span> {selectedBus?.distance}
              </li>
              <li>
                <span className="bold">MPH:</span> {selectedBus?.mph}
              </li>
            </ul>
          </div>
        </div>
      )}
      {showInfo && (
        <div className="info__container">
          <div className="info__text">
            <p className="bold info__header">
              Using real-time data provided by{' '}
              <a
                href="https://www.metrostlouis.org/developer-resources/"
                rel="nofollow"
              >
                Metro St. Louis Developer Resources
              </a>{' '}
              music is created using the current movement of St. Louis&apos;s
              fleet of busses.
            </p>
            <ul className="bottom-margin">
              <li>
                <strong>Pitch</strong> - determined using the latitude of the
                bus. Busses further north have a higher pitch, south lower.
              </li>
              <li>
                <strong>Panning</strong> — Busses further west will play more in
                your left ear, east right.
              </li>
              <li>
                <strong>Attack and Release</strong> — Busses moving at a quicker
                pace will play the note stocato (more abrupt), slower bussess
                will play with a crescendo (slow increase in volume).
              </li>
              <li>
                <strong>Duration</strong> — Busses that cover more distance will
                hold their notes longer.
              </li>
            </ul>

            <p>
              <strong className="flourish">Step 1. &#10095; </strong>
              <span className="bold">
                Retrieve data about busses from metrostlouis.org.
              </span>{' '}
              Updated bus locations indicate movement. Using these movements,
              notes are played based on each bus&apos;s speed, distance traveled
              and location.
            </p>

            <p className="bold">Bus data example:</p>

            <pre>{`
  { 
    'id': '6713', 
    'latitude': 38.66791915893555, 
    'longitude': -90.44339752197266, 
    'timestamp': '1680005702', 
    'label': '98 Ballas-North Hanley - SOUTH', 
    'distance': 0.14548427720869206, 
    'mph': 16.366981185977856 
  }
          `}</pre>
            <button
              className="bottom-margin"
              type="button"
              onClick={() =>
                dispatch(
                  defaultMapPositionSet([
                    38.66791915893555, -90.44339752197266,
                  ]),
                )
              }
            >
              center example
            </button>
            <p>
              <strong className="flourish">Step 2. &#10095; </strong>{' '}
              <span className="bold">Find an octave to play in.</span> The
              busses latitudes are divided into six sections. Each one
              representing an octave register. The 6th contains highest pitchs
              for busses furtherst north. The 1st register contains lowest
              pitchs for busses furthest south.
            </p>
            <p className="bottom-margin">
              If we look at the example, it&apos;s latitude will play a note in
              the 4th octave register.
            </p>
            <p className="bottom-margin">
              <strong className="flourish">Step 3. &#10095; </strong>{' '}
              <span className="bold">Panning.</span> Given it&apos;s longitude
              (east / west), the note will pan to the left 33%. We compare this
              bus&apos;s longitude to the average longitudes at this latitude.
              Notes in higher octaves are panned harder for audio engineering
              purposes.
            </p>

            <p className="bottom-margin">
              <strong className="flourish">Step 4. &#10095; </strong>{' '}
              <span className="bold">Begin the piece.</span> Busses get sorted
              by their timestamp, meaning the piece will begin with the first
              update recieved. As the piece moves along at 120 beats per second,
              each timestamp associated with that second begins playing their
              note. Busses that share timestamps (send their updates at the
              exact same second), get evenly distributed across the next 2 beats
              (1 second).
            </p>

            <p>
              <strong className="flourish">Step 5. &#10095; </strong>{' '}
              <span className="bold">Pick a note.</span> We keep track of the
              progress of the piece so a musical progression can repeat. Each
              progression lasts four measures. A chord containing 4 notes
              relates to each measure. For example the default chord progresson
              looks like the following
            </p>

            <pre>{`
  [
    ['D', 'E', 'F#', 'A'],  // measure 1 
    ['B', 'A', 'E', 'C#'],  // measure 2 
    ['E', 'F#', 'G#', 'B'], // measure 3 
    ['A', 'F#', 'E', 'C#'], // measure 4 
  ],
          `}</pre>

            <p>
              Assuming our example bus plays in the first measure, it will
              randomly choose one of the notes from the measure 1 chord. If our
              bus chooses F# we can now associate our busses octave (4) and note
              (F#) with an exact frequency.
            </p>

            <pre>
              {`
    G: 195.9977179908746, 
    'G#': 207.65234878997256, 
    A: 220.0, 
    'A#': 233.0818807590449, 
    B: 246.941650628062, 
  }, 
  4: { 
    C: 261.6255653005986, 
    'C#': 277.182630976872,
    D: 293.6647679174075, 
    'D#': 311.1269837220809, 
    E: 329.62755691286992, 
    F: 349.228231433003884, 
    'F#': 369.9944227116343, 
    G: 391.9954359817493, 
    'G#': 415.30469757994513, 
    A: 440.0, 
    'A#': 466.1637615180899, 
    B: 493.8833012561241, 
  }, 
  5: { 
    C: 523.2511306011972, 
    'C#': 554.365261953744, 
    D: 587.3295358348151, 
    'D#': 622.2539674441618, 
    E: 659.2551138257398, 
    F: 698.4564628660077,
            `}{' '}
            </pre>

            <p className="bold bottom-margin">
              4: F#: gives us the frequency of 369.9944227116343.
            </p>

            <p>
              <strong className="flourish">Step 6. &#10095; </strong>{' '}
              <span className="bold">Note length and shape.</span> We&apos;ve
              calculated the frequency and beginning of each note. For endng the
              note, we multiply distance by 10. That would mean our example bus
              plays nearly one and a half beats. No bus plays longer than eight
              beats or shorter than one. With the Busses mph we detrmine when
              the note should hit peak volume. Our slightly slower than average
              bus will have a tiny crescendo.
            </p>

            <p>
              Now our bus knows when to begin and end. It has pitch, panning and
              movement. The bus is ready to play when called on.
            </p>
          </div>
          <button
            className="bottom-margin"
            type="button"
            onClick={() => playSweep(sweep())}
          >
            play example
          </button>

          <p>
            <strong className="flourish">Other. &#10095; </strong>{' '}
            <span className="bold">What if a bus doesn&apos;t move?</span> For
            each bus not included in the data, a note rings out, forming a chord
            (if more than one). Always played on the 4th measure.
          </p>

          <p className="bottom-margin">
            For every 10 busses that have not moved, notes play in succession
            forming an arpeggio (if more than one). Rising if in the 1st or 3rd
            measure, descending if the 2nd or 4th.
          </p>
        </div>
      )}
    </div>
  )
}
