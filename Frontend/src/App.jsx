import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Toolbar from './components/Toolbar'
import ControlBox from './components/ControlBox'
import Display from './components/Display'

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [imagePath, setImagePath] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [selectedTool, setSelectedTool] = useState('pointer');
  const [measurementData, setMeasurementData] = useState(null);
  const [shapes, setShapes] = useState([]);

  const handleImageLoad = (url) => {
    setCurrentImageUrl(url);
  };

  const handleSelectTool = (toolId) => {
    setSelectedTool(toolId);
  };

  const handleMeasurement = (data) => {
    setMeasurementData(data);
  };

  const handleShapesUpdate = (newShapes) => {
    setShapes(newShapes);
  };

  const handleClearShapes = () => {
    if (window.confirm('Are you sure you want to clear all measurements?')) {
      setShapes([]);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="h-10 z-50 relative">
        <Navbar 
          imagePath={imagePath} 
          setImagePath={setImagePath} 
        />
      </div>
      <div className="h-8 mt-5 z-40 relative">
        <Toolbar 
          onSelectTool={handleSelectTool}
          selectedTool={selectedTool}
          measurementData={measurementData}
          onClearShapes={handleClearShapes}
        />
      </div>
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[180px] h-full z-30">
          <ControlBox 
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            setImagePath={setImagePath}
          />
        </div>
        <div className="absolute inset-0 overflow-auto">
          <Display
            isRecording={isRecording}
            imagePath={imagePath}
            onImageLoad={handleImageLoad}
            selectedTool={selectedTool}
            onSelectTool={handleSelectTool}
            shapes={shapes}
            onShapesUpdate={handleShapesUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default App;