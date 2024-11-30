import React from 'react'
import Navbar from './components/Navbar'
import './App.css'
import ControlPanel from './components/ControlPanel'

const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ControlPanel/>
    </div>
  )
}

export default App