import React from 'react'

import { AiFillCloseCircle } from 'react-icons/ai'
import { busVisibilitySet } from '../busses/bussesSlice'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import './info.css'

export default function Info() {
  const dispatch = useAppDispatch()

  const { busIsVisible, selectedBus } = useAppSelector((state) => state.busses)
  return (
    <div
      className={`preview__container preview__container--${
        busIsVisible && selectedBus && 'active'
      }`}
    >
      <button
        type="button"
        className="preview__close"
        onClick={() => dispatch(busVisibilitySet(false))}
      >
        <AiFillCloseCircle />
      </button>
      {selectedBus && (
        <div className="preview__description__container">
          <div className="preview__title">{selectedBus?.label}</div>
          <div className="preview__description">
            <ul>
              <li>latitude: {selectedBus?.latitude}</li>
              <li>longitude: {selectedBus?.longitude}</li>
              <li>
                timestamp:{' '}
                {new Date(
                  parseInt(selectedBus.timestamp, 10) * 1000,
                ).toDateString()}{' '}
                |{' '}
                {new Date(
                  parseInt(selectedBus.timestamp, 10) * 1000,
                ).toTimeString()}
              </li>
              <li>vehicle id: {selectedBus?.id}</li>
            </ul>
          </div>
        </div>
      )}
      <div className="info__container">
        <div className="info__text">
          <p>
            The application retrieves data about the movement of public busses
            from metrostlouis.org
          </p>

          <p>
            Busses whose locations have updated indicates movement, playing a
            note based on that bus&apos;s speed, distance and location.
          </p>

          <p>
            For each bus not included in the data, a note rings out, forming a
            chord (if more than one). Always played on the 4th measure.
          </p>

          <p>
            For every 10 busses that have not moved, notes play in succession
            forming an arpeggio (if more than one). Rising if in the 1st or 3rd
            measure, descending if the 2nd or 4th.
          </p>

          <pre>
            &lbrace; &apos;id&apos;: &apos;6713&apos;, &apos;latitude&apos;:
            38.66791915893555, &apos;longitude&apos;: -90.44339752197266,
            &apos;timestamp&apos;: &apos;1680005702&apos;, &apos;label&apos;:
            &apos;98 Ballas-North Hanley - SOUTH&apos;, &apos;distance&apos;:
            0.14548427720869206, &apos;timing&apos;: 32, &apos;mph&apos;:
            16.366981185977856 &rbrace;
          </pre>

          <p>
            If we look at this example of a bus given it&apos;s latitude will
            play a note in the 4th octave register. (Divides latitudes into six
            octave registers. 6th contains highest pitchs for busses furtherst
            north. 1st register contains lowest pitchs for furthest south.)
            Given it&apos;s longitude, the note will pan to the left 33%.
            (Compared to average longitudes at this latitude, with notes in
            higher octaves panned harder.)
          </p>

          <p>
            Using the amount of miles traveled (distance) since the last update
            32 seconds ago (timing) we calculate a speed around 16.4 miles per
            hour (mph). We can now calculate the exact time, duration and
            frequency of the note the bus will play.
          </p>

          <p>
            Busses get sorted by their timestamp, meaning the piece will begin
            with the first update recieved. As the piece moves along at 120
            beats per second, each timestamp associated with that second will
            begin playing their note. Busses that share timestamps (send their
            updates at the exact same second), get evenly distributed across the
            next 2 beats (1 second).
          </p>

          <p>
            Keeping track of the progress of the piece, a musical progression
            repeats. Each progression lasts four measures. A chord containing 4
            notes relates to each measure. For example the default progresson
            looks like the following
          </p>

          <pre>
            [ [&apos;D&apos;, &apos;E&apos;, &apos;F#&apos;, &apos;A&apos;], //
            measure 1 [&apos;B&apos;, &apos;A&apos;, &apos;E&apos;,
            &apos;C#&apos;], // measure 2 [&apos;E&apos;, &apos;F#&apos;,
            &apos;G#&apos;, &apos;B&apos;], // measure 3 [&apos;A&apos;,
            &apos;F#&apos;, &apos;E&apos;, &apos;C#&apos;], // measure 4 ],
          </pre>

          <p>
            If our example bus plays in the first measure, it will randomly
            choose one of the notes from the measure 1 chord. If our bus
            randomly chooses F# we can now associate our busses octave (4) and
            note (F#) with an exact frequency.
          </p>

          <pre>
            G: 195.9977179908746, &apos;G#&apos;: 207.65234878997256, A: 220.0,
            &apos;A#&apos;: 233.0818807590449, B: 246.941650628062, &rbrace;, 4:
            &lbrace; C: 261.6255653005986, &apos;C#&apos;: 277.182630976872, D:
            293.6647679174075, &apos;D#&apos;: 311.1269837220809, E:
            329.62755691286992, F: 349.228231433003884, &apos;F#&apos;:
            369.9944227116343, G: 391.9954359817493, &apos;G#&apos;:
            415.30469757994513, A: 440.0, &apos;A#&apos;: 466.1637615180899, B:
            493.8833012561241, &rbrace;, 5: &lbrace; C: 523.2511306011972,
            &apos;C#&apos;: 554.365261953744, D: 587.3295358348151,
            &apos;D#&apos;: 622.2539674441618, E: 659.2551138257398, F:
            698.4564628660077,
          </pre>

          <p>4: F#: gives us the frequency of 369.9944227116343.</p>

          <p>
            We&apos;ve calculated the frequency and beginning of each note. For
            endng the note, we multiply distance by 10. That would mean our
            example bus plays nearly one and a half beats. No bus plays longer
            than eight beats or shorter than one. With the Busses mph we
            detrmine when the note should hit peak volume. Our slightly slower
            than average bus will have a short crescendo.
          </p>

          <p>
            Now our bus knows when to begin and end. It has pitch, panning and
            movement. The bus is ready to play when called on.
          </p>
        </div>
      </div>
    </div>
  )
}
