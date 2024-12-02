<<<<<<< HEAD
import React from "react";
import { CameraProvider } from "./components/CameraContext";
import { ControlPanel, Navbar,Canvas } from './components'

const App = () => (
  <CameraProvider>
    <Navbar/>
    <ControlPanel />
    <Canvas />
  </CameraProvider>
);
=======
import { ControlPanel,Navbar } from './components'
import './App.css'
import Popup from './components/Popup'
const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ControlPanel/>
      <Popup/> 
    </div>
  )
}
>>>>>>> popup

export default App;
