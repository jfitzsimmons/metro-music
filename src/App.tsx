import React from 'react'
import Score from './components/Score/Score'
import Controls from './components/Controls/Controls'
import Map from './components/Map/Map'
import Preview from './components/Preview/Preview'
import './App.css'

function App() {
  return (
    <main>
      <>{console.log('App Return testjpf')}</>
      <Score />
      <Controls />
      <Map />
      <Preview />
    </main>
  )
}

export default App
