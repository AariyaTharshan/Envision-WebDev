import React, { useState } from 'react'
import Navbar from './components/Navbar'
import ControlBox from './components/ControlBox'
import Display from './components/Display'

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [imagePath, setImagePath] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  const handleImageLoad = (url) => {
    setCurrentImageUrl(url);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar 
        imagePath={imagePath} 
        setImagePath={setImagePath} 
      />
      <main className="flex-1 relative">
        <Display 
          isRecording={isRecording} 
          imagePath={imagePath}
          onImageLoad={handleImageLoad}
        />
        <ControlBox 
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          setImagePath={setImagePath}
        />
      </main>
    </div>
  );
};

export default App;