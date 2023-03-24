import React from 'react'
import Score from './features/score/Score'
import Controls from './features/controls/Controls'
import Map from './features/map/Map'
// import Preview from './features/preview/Preview'
import './App.css'

function App() {
  return (
    <main>
      <Score />
      <Controls />
      <Map />
      {/**  <Preview /> */}
    </main>
  )
}

export default App
