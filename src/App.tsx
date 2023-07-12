import React from 'react'
import Score from './features/score/Score'
import Controls from './features/controls/Controls'
import Map from './features/map/Map'
import Info from './features/info/Info'

import './App.css'

export default function App() {
  return (
    <main>
      <Score />
      <Controls />
      <Map />
      <Info />
    </main>
  )
}
