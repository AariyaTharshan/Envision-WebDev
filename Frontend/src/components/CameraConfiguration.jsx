import React, { useState } from 'react';

function CameraConfiguration({ onClose }) {
  const [resolution, setResolution] = useState('');
  const [camera, setCamera] = useState('');
  const [cameraType, setCameraType] = useState('Default');

  // Handle change for resolution dropdown
  const handleResolutionChange = (e) => {
    setResolution(e.target.value);
  };

  // Handle change for camera dropdown
  const handleCameraChange = (e) => {
    setCamera(e.target.value);
  };

  // Handle change for camera type radio buttons
  const handleCameraTypeChange = (e) => {
    setCameraType(e.target.value);
  };

  // Handle save action
  const handleSave = () => {
    console.log('Saved Camera Configuration:', { resolution, camera, cameraType });
    // Optionally close the modal after save
    if (onClose) {
      onClose();
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    console.log('Cancelled Camera Configuration');
    // Reset all states
    setResolution('');
    setCamera('');
    setCameraType('Default');
    // Close the modal when cancelled
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        className="bg-white text-gray-700 rounded-lg shadow-2xl p-8 max-w-lg mx-auto mt-12 space-y-6 transform transition-all duration-300"
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Camera Configuration</h2>

        {/* Resolution Dropdown */}
        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-700">Resolution</label>
          <select
            value={resolution}
            onChange={handleResolutionChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Resolution</option>
            <option value="1920x1080">1920x1080</option>
            <option value="1280x720">1280x720</option>
            <option value="640x480">640x480</option>
            <option value="2560x1440">2560x1440</option>
            <option value="3840x2160">3840x2160</option>
          </select>
        </div>

        {/* Camera Dropdown */}
        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-700">Camera</label>
          <select
            value={camera}
            onChange={handleCameraChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Camera</option>
            <option value="Camera 1">Camera 1</option>
            <option value="Camera 2">Camera 2</option>
            <option value="Camera 3">Camera 3</option>
            <option value="Camera 4">Camera 4</option>
          </select>
        </div>

        {/* Camera Type Radio Buttons */}
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">Camera Type</label>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="default"
                name="cameraType"
                value="Default"
                checked={cameraType === 'Default'}
                onChange={handleCameraTypeChange}
                className="text-blue-500"
              />
              <label htmlFor="default" className="text-lg text-gray-700">Default</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="others"
                name="cameraType"
                value="Others"
                checked={cameraType === 'Others'}
                onChange={handleCameraTypeChange}
                className="text-blue-500"
              />
              <label htmlFor="others" className="text-lg text-gray-700">Others</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="twain"
                name="cameraType"
                value="Twain"
                checked={cameraType === 'Twain'}
                onChange={handleCameraTypeChange}
                className="text-blue-500"
              />
              <label htmlFor="twain" className="text-lg text-gray-700">Twain</label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-6">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CameraConfiguration;
