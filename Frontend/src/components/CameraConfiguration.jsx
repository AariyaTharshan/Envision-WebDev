import React, { useState, useEffect } from 'react';

const CameraConfiguration = () => {
  const [selectedCamera, setSelectedCamera] = useState('');
  const [resolution, setResolution] = useState('1920x1080');
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [saveStatus, setSaveStatus] = useState(''); // For showing save status message

  const cameras = [
    'MSHOT',
    'HIKERBOT',
    'USBC',
    'WEBCAM'
  ];

  const resolutionOptions = [
    '640x480',
    '1280x720',
    '1920x1080',
    '2560x1440',
    '3840x2160'
  ];

  // Load saved settings when component mounts
  useEffect(() => {
    const savedSettings = localStorage.getItem('cameraSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setSelectedCamera(settings.camera || '');
        setResolution(settings.resolution || '1920x1080');
        
        // Update dimensions based on saved resolution
        const [width, height] = settings.resolution.split('x').map(Number);
        setDimensions({ width, height });
        
        console.log('Loaded saved settings:', settings);
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  // Update dimensions when resolution changes
  useEffect(() => {
    const [width, height] = resolution.split('x').map(Number);
    setDimensions({ width, height });
  }, [resolution]);

  const handleSave = async () => {
    if (!selectedCamera) {
      setSaveStatus('Please select a camera');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    try {
      // Save to localStorage for persistence
      const settings = {
        camera: selectedCamera,
        resolution: resolution,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('cameraSettings', JSON.stringify(settings));
      
      setSaveStatus('Settings saved successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Error saving settings');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="w-80 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
        <svg 
          className="w-5 h-5 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
          />
        </svg>
        <h2 className="text-lg font-semibold text-gray-800">Camera Setup</h2>
      </div>

      <div className="space-y-4">
        {/* Camera Selection */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Camera Type
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm 
              focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
              bg-white text-sm"
          >
            <option value="">Select Camera</option>
            {cameras.map(camera => (
              <option key={camera} value={camera}>{camera}</option>
            ))}
          </select>
        </div>

        {/* Resolution Selection */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Resolution
          </label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm 
              focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
              bg-white text-sm"
          >
            {resolutionOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Dimensions Display */}
        <div className="grid grid-cols-2 gap-3">
          {/* Width Display */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Width
            </label>
            <input
              type="text"
              value={dimensions.width}
              readOnly
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md 
                bg-white text-sm text-gray-600"
            />
          </div>

          {/* Height Display */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Height
            </label>
            <input
              type="text"
              value={dimensions.height}
              readOnly
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md 
                bg-white text-sm text-gray-600"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
              hover:bg-blue-700 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Configuration
          </button>
          
          {/* Save Status Message */}
          {saveStatus && (
            <div className={`mt-2 text-sm text-center ${
              saveStatus.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}>
              {saveStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraConfiguration; 