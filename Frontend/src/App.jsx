import React, { useState } from 'react'
import Navbar from './components/Navbar'
import ControlBox from './components/ControlBox'
import Display from './components/Display'

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [imagePath, setImagePath] = useState(null);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar className="flex-none" />
      <main className="flex-1 relative">
        <Display 
          isRecording={isRecording} 
          imagePath={imagePath} 
        />
        <ControlBox 
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          setImagePath={setImagePath}
        />
      </main>
    </div>
  )
}

export default App