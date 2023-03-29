# Music performed by St. Louis Metro Bus Drivers

Coded with React, Redux, Web Audio API, Leaflet + OpenStreetMap, gtfs-realtime-bindings

[![Metro Music Preview Image](https://github.com/jfitzsimmons/metro-music/blob/main/preview.png)](https://metrobusorchestra.netlify.app/ 'St. Louis Metro Bus Drivers perform a IV-I-V-vi progression in A Major')

> **What?**  
> Using real-time data provided by [Metro St. Louis Developer Resources](https://www.metrostlouis.org/developer-resources/) music is created using the current movement of St. Louis's fleet of busses.
>
> - Pitch - determined using the latitude of the bus. Busses further north have a higher pitch, south lower.
> - Panning — Busses further west will play more in your left ear, east right.
> - Attack and Release — Busses moving at a quicker pace will play the note stocato (more abrupt), slower bussess will play with a crescendo (slow increase in volume).
> - Duration — Busses that cover more distance will hold their notes longer.

**Step 1. ❯** Retrieve data about busses from metrostlouis.org. Updated bus locations indicate movement. Using these movements, notes are played based on each bus's speed, distance traveled and location.

Bus data example:

```
  {
    'id': '6713',
    'latitude': 38.66791915893555,
    'longitude': -90.44339752197266,
    'timestamp': '1680005702',
    'label': '98 Ballas-North Hanley - SOUTH',
    'distance': 0.14548427720869206,
    'mph': 16.366981185977856
  }
```

**Step 2. ❯** Find an octave to play in. The busses latitudes are divided into six sections. Each one representing an octave register. The 6th contains highest pitchs for busses furtherst north. The 1st register contains lowest pitchs for busses furthest south.

If we look at the example, it's latitude will play a note in the 4th octave register.

**Step 3. ❯** Panning. Given it's longitude (east / west), the note will pan to the left 33%. We compare this bus's longitude to the average longitudes at this latitude. Notes in higher octaves are panned harder for audio engineering purposes.

**Step 4. ❯** Begin the piece. Busses get sorted by their timestamp, meaning the piece will begin with the first update recieved. As the piece moves along at 120 beats per second, each timestamp associated with that second begins playing their note. Busses that share timestamps (send their updates at the exact same second), get evenly distributed across the next 2 beats (1 second).

**Step 5. ❯** Pick a note. We keep track of the progress of the piece so a musical progression can repeat. Each progression lasts four measures. A chord containing 4 notes relates to each measure. For example the default chord progresson looks like the following

```
  [
    ['D', 'E', 'F#', 'A'],  // measure 1
    ['B', 'A', 'E', 'C#'],  // measure 2
    ['E', 'F#', 'G#', 'B'], // measure 3
    ['A', 'F#', 'E', 'C#'], // measure 4
  ],
```

Assuming our example bus plays in the first measure, it will randomly choose one of the notes from the measure 1 chord. If our bus chooses F# we can now associate our busses octave (4) and note (F#) with an exact frequency.

```
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

```

4: F#: gives us the frequency of 369.9944227116343.

**Step 6. ❯** Note length and shape. We've calculated the frequency and beginning of each note. For endng the note, we multiply distance by 10. That would mean our example bus plays nearly one and a half beats. No bus plays longer than eight beats or shorter than one. With the Busses mph we detrmine when the note should hit peak volume. Our slightly slower than average bus will have a tiny crescendo.

Now our bus knows when to begin and end. It has pitch, panning and movement. The bus is ready to play when called on.

## Acknowledgments

- inspired by [Digital fixation of audio processes](https://orchestra.stranno.su/)
