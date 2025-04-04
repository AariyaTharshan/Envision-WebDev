import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Toolbar from './components/Toolbar'
import ControlBox from './components/ControlBox'
import Display from './components/Display'
import ImageList from './components/ImageList'

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [imagePath, setImagePath] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [selectedTool, setSelectedTool] = useState('pointer');
  const [measurementData, setMeasurementData] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [currentFolderPath, setCurrentFolderPath] = useState('C:\\Users\\Public\\MicroScope_Images');
  const [currentColor, setCurrentColor] = useState('#00ff00');
  const [currentFontColor, setCurrentFontColor] = useState('#ffffff');
  const [currentThickness, setCurrentThickness] = useState(2);
  const [currentCalibration, setCurrentCalibration] = useState(null);

  useEffect(() => {
    const loadCalibration = () => {
      const savedCalibration = localStorage.getItem('currentCalibration');
      if (savedCalibration) {
        setCurrentCalibration(JSON.parse(savedCalibration));
      }
    };

    loadCalibration();
    window.addEventListener('storage', loadCalibration);
    return () => window.removeEventListener('storage', loadCalibration);
  }, []);

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

  const handleImageSelect = (imagePath) => {
    setImagePath(imagePath);
  };

  const handleImageDelete = (imagePath) => {
    if (imagePath === imagePath) {
      setImagePath(null);
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
      <div className="h-8 z-40 relative">
        <Toolbar 
          onSelectTool={handleSelectTool}
          selectedTool={selectedTool}
          measurementData={measurementData}
          onClearShapes={handleClearShapes}
          onColorChange={setCurrentColor}
          onFontColorChange={setCurrentFontColor}
          onThicknessChange={setCurrentThickness}
          currentColor={currentColor}
          currentFontColor={currentFontColor}
          currentThickness={currentThickness}
          currentCalibration={currentCalibration}
        />
      </div>
      <div className="flex-1 relative overflow-hidden">
        <div className="fixed bottom-16 left-6 z-30">
          <div className="w-[288px]">
            <ControlBox 
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              setImagePath={setImagePath}
              onFolderChange={setCurrentFolderPath}
            />
          </div>
        </div>
        <div className="absolute inset-0 overflow-auto z-10">
          <Display
            isRecording={isRecording}
            imagePath={imagePath}
            onImageLoad={handleImageLoad}
            selectedTool={selectedTool}
            shapes={shapes}
            onShapesUpdate={handleShapesUpdate}
            currentColor={currentColor}
            currentFontColor={currentFontColor}
            currentThickness={currentThickness}
            onColorChange={setCurrentColor}
            onFontColorChange={setCurrentFontColor}
          />
        </div>

        <ImageList
          currentPath={currentFolderPath}
          onSelectImage={handleImageSelect}
          onDeleteImage={handleImageDelete}
        />
      </div>
    </div>
  );
};

export default App;