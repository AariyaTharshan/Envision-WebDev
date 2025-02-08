import React, { useState } from 'react';

const ControlBox = ({ isRecording, setIsRecording, setImagePath }) => {
  const [magnification, setMagnification] = useState('100x');
  const [location, setLocation] = useState('C:\\Users\\Public\\MicroScope_Images');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const magnificationOptions = ['50x', '100x', '200x', '500x', '1000x'];

  const handleRecord = async () => {
    try {
      if (!isRecording) {
        // Get camera settings from localStorage
        const savedSettings = localStorage.getItem('cameraSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : null;
        const cameraType = settings ? settings.camera : null;

        console.log('Starting camera with type:', cameraType); // Debug log

        const response = await fetch('http://localhost:5000/api/start-camera', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cameraType: cameraType
          })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
          setIsRecording(true);
          setImagePath(null);
        } else {
          alert('Failed to start camera: ' + data.message);
        }
      } else {
        await fetch('http://localhost:5000/api/stop-camera', {
          method: 'POST'
        });
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error controlling camera:', error);
      alert('Error controlling camera: ' + error.message);
    }
  };

  const handleSnap = async () => {
    try {
      await fetch('http://localhost:5000/api/stop-camera', {
        method: 'POST'
      });
      setIsRecording(false);

      const response = await fetch('http://localhost:5000/api/snapshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ savePath: location })
      });

      const data = await response.json();
      if (data.status === 'success') {
        console.log('Image saved at:', data.filepath);
        setImagePath(data.filepath);
      } else {
        alert('Failed to take snapshot: ' + data.message);
      }
    } catch (error) {
      console.error('Error taking snapshot:', error);
      alert('Error taking snapshot: ' + error.message);
    }
  };

  const handleImport = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/import-image', {
        method: 'POST',
        body: formData // Don't set Content-Type, browser will set it automatically
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        console.log('Image imported at:', data.filepath);
        setIsRecording(false);
        setImagePath(data.filepath);
      } else {
        alert('Failed to import image: ' + data.message);
      }
    } catch (error) {
      console.error('Error importing image:', error);
      alert('Error importing image: ' + error.message);
    }
  };

  const handleFolderPick = async () => {
    try {
      // Call electron's folder picker through window.electron
      const folderPath = await window.electron.openFolder();
      if (folderPath) {
        setLocation(folderPath);
        // Update server with new save path
        const response = await fetch('http://localhost:5000/api/set-save-path', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: folderPath
          })
        });

        const data = await response.json();
        if (!data.status === 'success') {
          alert('Failed to update save location');
        }
      }
    } catch (error) {
      console.error('Error picking folder:', error);
      alert('Error selecting folder: ' + error.message);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 bg-white rounded-lg shadow-xl p-4 w-72 border border-gray-200">
      {/* Control Buttons Row */}
      <div className="flex justify-between mb-4 gap-2">
        {/* Record Button */}
        <button
          onClick={handleRecord}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
            ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}
            hover:scale-105 active:scale-95`}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
        </button>

        {/* Snap Button */}
        <button
          onClick={handleSnap}
          className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center
            hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
          title="Take Snapshot"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M3 9a2 2 0 012-2h2.5l1-2h5l1 2H17a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
        </button>

        {/* Import Button */}
        <label 
          className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center
            hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Import Image"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImport}
            className="hidden"
          />
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </label>
      </div>

      {/* Settings Section */}
      <div className="space-y-3">
        {/* Save Location Picker */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-24">Save Path:</label>
          <div className="flex-1 flex gap-1">
            <input
              type="text"
              value={location}
              readOnly
              className="flex-1 p-1 border rounded text-sm bg-gray-50"
              title={location}
            />
            <button
              onClick={handleFolderPick}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              title="Pick Folder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Magnification Compact Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-24">Magnification:</label>
          <select
            value={magnification}
            onChange={(e) => setMagnification(e.target.value)}
            className="flex-1 p-1 border rounded text-sm"
          >
            {magnificationOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-24">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="flex-1 p-1 border rounded text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-24">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="flex-1 p-1 border rounded text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ControlBox;