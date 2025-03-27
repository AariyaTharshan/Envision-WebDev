import React, { useState, useRef, useEffect } from 'react';

const CameraCalibrate = ({ imagePath }) => {
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState({ x: 0, y: 0 }); // pixels per micron
  const [calibrationLine, setCalibrationLine] = useState({ start: null, end: null });
  const [isDrawing, setIsDrawing] = useState(false);
  const [measurementValue, setMeasurementValue] = useState('');
  const [unit, setUnit] = useState('microns'); // 'microns' or 'cm'
  const [lines, setLines] = useState([]); // Store multiple measurements
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [realScale, setRealScale] = useState({ x: 0, y: 0 }); // pixels to unit conversion
  const [currentMeasurement, setCurrentMeasurement] = useState(null);
  const [canDrawLine, setCanDrawLine] = useState(true);
  const [calibrationData, setCalibrationData] = useState({
    pixelDistance: 0,
    actualDistance: 0,
    unit: 'mm',
    calibrationFactor: 0
  });
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [calibrationType, setCalibrationType] = useState(null); // 'new' or 'existing'
  const [magnification, setMagnification] = useState('100x');
  const [existingCalibrations, setExistingCalibrations] = useState({});
  const [selectedExistingCalibration, setSelectedExistingCalibration] = useState(null);

  // Add resolution state
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });

  // Add useEffect to load camera settings
  useEffect(() => {
    const loadCameraSettings = () => {
      const savedSettings = localStorage.getItem('cameraSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          const [width, height] = settings.resolution.split('x').map(Number);
          setResolution({ width, height });
        } catch (error) {
          console.error('Error loading camera settings:', error);
        }
      }
    };

    loadCameraSettings();
    // Listen for changes in camera settings
    window.addEventListener('storage', loadCameraSettings);
    return () => window.removeEventListener('storage', loadCameraSettings);
  }, []);

  // Add reset calibration function
  const resetCalibration = () => {
    setLines([]);
    setCalibrationLine({ start: null, end: null });
    setCanDrawLine(true);
    setMeasurementValue('');
    setRealScale({ x: 0, y: 0 });
    setCurrentMeasurement(null);
  };

  // Modify initializeCanvas to draw image without scaling
  const initializeCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match camera resolution
    canvas.width = resolution.width;
    canvas.height = resolution.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image at full resolution
    ctx.drawImage(img, 0, 0, resolution.width, resolution.height);
  };

  // Modify drawScaleMarkers to show calibrated values
  const drawScaleMarkers = (ctx, width, height) => {
    ctx.strokeStyle = '#333';
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    
    const step = 100; // pixels between markers
    
    // Draw X axis scale
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, height - 20);
      ctx.lineTo(x, height - 10);
      ctx.stroke();
      
      if (realScale.x) {
        // Convert pixels to calibrated units
        const realValue = (x / scaleFactor / realScale.x).toFixed(2);
        ctx.fillText(`${realValue} ${unit}`, x - 20, height - 5);
      } else {
        // Show original pixels
        ctx.fillText(`${Math.round(x / scaleFactor)}px`, x - 15, height - 5);
      }
    }
    
    // Draw Y axis scale
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(20, y);
      ctx.stroke();
      
      if (realScale.x) {
        // Convert pixels to calibrated units
        const realValue = (y / scaleFactor / realScale.x).toFixed(2);
        ctx.fillText(`${realValue} ${unit}`, 25, y + 5);
      } else {
        // Show original pixels
        ctx.fillText(`${Math.round(y / scaleFactor)}px`, 25, y + 5);
      }
    }
  };

  // Modify getScaledCoordinates to get actual coordinates
  const getScaledCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Convert click coordinates to canvas coordinates
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  // Function to save the canvas as image
  const saveImage = () => {
    const canvas = canvasRef.current;
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = 'calibrated-image.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Modified handleMouseDown
  const handleMouseDown = (e) => {
    if (!image || !canDrawLine) return;
    
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
    setIsDrawing(true);
    // Start point is where user clicks
    setCalibrationLine({
        start: { x, y },
        end: { x, y },
        measurement: null
    });
  };

  // Simplify handleMouseMove
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const coords = getScaledCoordinates(e.clientX, e.clientY);
    setCalibrationLine(prev => ({
        ...prev,
        end: { 
        x: coords.x,
        y: prev.start.y // Keep y coordinate same as start point
        }
    }));
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Convert pixels to real units
  const convertToRealUnits = (pixels) => {
    if (!realScale.x) return null;
    const realValue = pixels / scaleFactor / realScale.x;
    return realValue.toFixed(2);
  };

  // Modify handleMeasurementSubmit to handle single calibration
  const handleMeasurementSubmit = (e) => {
    if (e) e.preventDefault();
    if (!measurementValue || isNaN(measurementValue)) {
        alert('Please enter a valid measurement value');
        return;
    }

    const value = parseFloat(measurementValue);
    const pixelDistance = Math.sqrt(
        Math.pow(calibrationLine.end.x - calibrationLine.start.x, 2)
    );

    // Calculate pixels per unit
    const pixelsPerUnit = pixelDistance / value;
    setRealScale({ 
        x: pixelsPerUnit,
        y: pixelsPerUnit
    });

    // Update calibration data
    setCalibrationData({
        pixelDistance: pixelDistance,
        actualDistance: value,
        unit: unit,
        calibrationFactor: pixelsPerUnit
    });

    // Store calibration line
    setLines([{
        ...calibrationLine,
        measurement: value,
        unit: unit,
        pixelDistance: pixelDistance,
        pixelsPerUnit: pixelsPerUnit,
        calibrationDate: new Date().toISOString()
    }]);

    setMeasurementValue('');
    setCanDrawLine(false);
    
    // Redraw canvas with updated measurements
    const ctx = canvasRef.current.getContext('2d');
    drawImage();
    drawLine(ctx);
  };

  // Calculate real-time measurement while drawing
  useEffect(() => {
    if (calibrationLine.start && calibrationLine.end && realScale.x) {
      const pixelDistance = Math.sqrt(
        Math.pow(calibrationLine.end.x - calibrationLine.start.x, 2) +
        Math.pow(calibrationLine.end.y - calibrationLine.start.y, 2)
      );
      const realDistance = convertToRealUnits(pixelDistance);
      setCurrentMeasurement(realDistance);
    } else {
      setCurrentMeasurement(null);
    }
  }, [calibrationLine, realScale]);

  // Add this new function to draw scale bar
  const drawScaleBar = (ctx, width, height) => {
    if (!realScale.x) return; // Only draw if calibrated

    const scaleBarLength = 100; // pixels
    const realDistance = (scaleBarLength / scaleFactor / realScale.x).toFixed(2);
    
    // Position the scale bar in the bottom right
    const margin = 50;
    const barY = height - margin;
    const barX = width - margin - scaleBarLength;

    // Draw the scale bar
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // Main line
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + scaleBarLength, barY);
    
    // End ticks
    ctx.moveTo(barX, barY - 5);
    ctx.lineTo(barX, barY + 5);
    ctx.moveTo(barX + scaleBarLength, barY - 5);
    ctx.lineTo(barX + scaleBarLength, barY + 5);
    
    ctx.stroke();

    // Draw the measurement text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${realDistance} ${unit}`, barX + scaleBarLength/2, barY - 10);
  };

  // Modify the calculatePixelDistance function to return original image pixels
  const calculatePixelDistance = (start, end) => {
    if (!start || !end) return null;
    
    // Convert display coordinates to original image coordinates
    const originalX1 = start.x / scaleFactor;
    const originalY1 = start.y / scaleFactor;
    const originalX2 = end.x / scaleFactor;
    const originalY2 = end.y / scaleFactor;
    
    // Use Pythagorean theorem for accurate distance
    const originalDistance = Math.sqrt(
      Math.pow(originalX2 - originalX1, 2) +
      Math.pow(originalY2 - originalY1, 2)
    );
    
    return originalDistance;
  };

  // Update the image loading effect
  useEffect(() => {
    if (imagePath) {
      const img = new Image();
      img.onload = () => {
        // Store original dimensions
        setOriginalDimensions({ width: img.width, height: img.height });
        setImage(img);
        imageRef.current = img;
        initializeCanvas(img);
      };
      img.src = `http://localhost:5000/api/get-image?path=${encodeURIComponent(imagePath)}`;
    }
  }, [imagePath, resolution]); // Add resolution to dependencies

  // Update the redraw effect
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, resolution.width, resolution.height);
    
    // Draw dimensions info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Resolution: ${resolution.width} × ${resolution.height} px`, 20, 30);

    // Draw calibration line with perpendicular ends
    if (calibrationLine.start && calibrationLine.end) {
      // Draw main horizontal line
      ctx.beginPath();
      ctx.moveTo(calibrationLine.start.x, calibrationLine.start.y);
      ctx.lineTo(calibrationLine.end.x, calibrationLine.start.y);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw perpendicular lines at endpoints
      const perpLength = 10; // Length of perpendicular lines

      // Left perpendicular line
      ctx.beginPath();
      ctx.moveTo(calibrationLine.start.x, calibrationLine.start.y - perpLength);
      ctx.lineTo(calibrationLine.start.x, calibrationLine.start.y + perpLength);
      ctx.stroke();

      // Right perpendicular line
      ctx.beginPath();
      ctx.moveTo(calibrationLine.end.x, calibrationLine.start.y - perpLength);
      ctx.lineTo(calibrationLine.end.x, calibrationLine.start.y + perpLength);
      ctx.stroke();

      // Draw measurement
      const pixelDistance = Math.abs(calibrationLine.end.x - calibrationLine.start.x);
        const midX = (calibrationLine.start.x + calibrationLine.end.x) / 2;
      const midY = calibrationLine.start.y - 20;
      
      ctx.fillStyle = 'black';
      ctx.fillRect(midX - 40, midY - 15, 80, 20);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(pixelDistance)} px`, midX, midY);
    }

  }, [image, calibrationLine, resolution]);

  // Add unit conversion helper
  const convertUnits = (value, fromUnit, toUnit) => {
    // More precise conversion factors
    const conversions = {
      microns: 1,
      mm: 1000,    // 1 mm = 1000 microns
      cm: 10000,   // 1 cm = 10000 microns
      um: 1        // alias for microns
    };
    
    // Convert to base unit (microns) first, then to target unit
    const inMicrons = value * conversions[fromUnit];
    return inMicrons / conversions[toUnit];
  };

  // Handle unit change
  const handleUnitChange = (newUnit) => {
    // Convert all existing measurements to new unit
    const updatedLines = lines.map(line => ({
      ...line,
      measurement: convertUnits(line.measurement, line.unit, newUnit),
      unit: newUnit
    }));
    setLines(updatedLines);
    setUnit(newUnit);
  };

  const validateCalibration = (pixelDistance, measurementValue) => {
    if (pixelDistance < 10) {
      throw new Error('Calibration line too short. Please draw a longer line for accurate calibration.');
    }
    
    if (measurementValue <= 0) {
      throw new Error('Measurement value must be greater than 0.');
    }
    
    // Check for reasonable calibration values based on magnification
    const pixelsPerMicron = pixelDistance / measurementValue;
    if (pixelsPerMicron < 0.01 || pixelsPerMicron > 100) {
      throw new Error('Calibration value seems incorrect. Please check your measurement.');
    }
  };

  const CalibrationInfo = ({ realScale, unit }) => {
    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900">Calibration Information</h4>
        <div className="mt-2 space-y-2">
          <p>Scale: {realScale.x.toFixed(4)} pixels/{unit}</p>
          <p>Resolution: {(1/realScale.x).toFixed(4)} {unit}/pixel</p>
          <p>Calibration Status: {realScale.x > 0 ? '✓ Calibrated' : '⚠️ Not Calibrated'}</p>
        </div>
      </div>
    );
  };

  // Add this function to load existing calibrations
  const loadExistingCalibrations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/get-calibrations');
      const data = await response.json();
      if (data.status === 'success') {
        setExistingCalibrations(data.calibrations);
      } else {
        console.error('Failed to load calibrations:', data.message);
      }
    } catch (error) {
      console.error('Error loading calibrations:', error);
    }
  };

  // Add useEffect to load existing calibrations when component mounts
  useEffect(() => {
    loadExistingCalibrations();
  }, []);

  // Add function to handle selecting existing calibration
  const handleSelectExistingCalibration = (calibration) => {
    setSelectedExistingCalibration(calibration);
    setRealScale({
      x: calibration.calibrationFactor,
      y: calibration.calibrationFactor
    });
    setUnit(calibration.unit);
    setCanDrawLine(false);
  };

  // Modify handleSaveCalibration to include magnification
  const handleSaveCalibration = async () => {
    try {
      if (!calibrationData.calibrationFactor) {
        alert('Please perform calibration first');
        return;
      }

      const calibrationToSave = {
        ...calibrationData,
        magnification,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('http://localhost:5000/api/save-calibration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          calibrationData: calibrationToSave
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Save calibration response:', data);

      if (data.status === 'success') {
        alert('Calibration data saved successfully');
      } else {
        alert('Failed to save calibration: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving calibration:', error);
      alert('Error saving calibration: ' + error.message);
    }
  };

  // Add calibration type selection component
  const CalibrationType = () => (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-semibold mb-4">Select Calibration Type</h3>
      <div className="flex gap-4">
        <button
          onClick={() => setCalibrationType('new')}
          className={`flex-1 py-3 px-6 rounded-lg transition-all duration-200 ${
            calibrationType === 'new'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          New Calibration
        </button>
        <button
          onClick={() => setCalibrationType('existing')}
          className={`flex-1 py-3 px-6 rounded-lg transition-all duration-200 ${
            calibrationType === 'existing'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Use Existing Calibration
        </button>
      </div>
    </div>
  );

  // Modify the ExistingCalibrations component to show more details
  const ExistingCalibrations = () => {
    return (
      <div className="space-y-6">
          {Object.entries(existingCalibrations).map(([mag, calibration]) => (
          <div key={mag} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">{mag}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Scale Factor:</span>{' '}
                    {calibration.calibrationFactor.toFixed(4)} pixels/micron
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Resolution:</span>{' '}
                    {(1/calibration.calibrationFactor).toFixed(4)} microns/pixel
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Calibrated:</span>{' '}
                    {new Date(calibration.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                  <button
                onClick={() => handleUseCalibration(calibration)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 
                  ${selectedExistingCalibration?.timestamp === calibration.timestamp 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                {selectedExistingCalibration?.timestamp === calibration.timestamp ? 'In Use' : 'Use'}
                  </button>
                </div>
            </div>
          ))}
    </div>
  );
  };

  // Update handleUseCalibration function
  const handleUseCalibration = (calibration) => {
    // Save the selected calibration to localStorage
    localStorage.setItem('currentCalibration', JSON.stringify({
      magnification: calibration.magnification,
      calibrationFactor: calibration.calibrationFactor,
      unit: calibration.unit,
      timestamp: calibration.timestamp
    }));

    // Update UI state
    setSelectedExistingCalibration(calibration);
    setRealScale({ 
      x: calibration.calibrationFactor,
      y: calibration.calibrationFactor 
    });

    // Force a storage event to notify other components
    window.dispatchEvent(new Event('storage'));

    // Close calibration dialog or update UI as needed
    setCalibrationType(null);
  };

  // Add delete calibration handler
  const handleDeleteCalibration = (magnification) => {
    if (window.confirm(`Are you sure you want to delete the ${magnification} calibration?`)) {
      // Remove from localStorage
      const updatedCalibrations = { ...existingCalibrations };
      delete updatedCalibrations[magnification];
      localStorage.setItem('calibrations', JSON.stringify(updatedCalibrations));
      setExistingCalibrations(updatedCalibrations);

      // If this was the selected calibration, clear it
      if (selectedExistingCalibration?.magnification === magnification) {
        setSelectedExistingCalibration(null);
        localStorage.removeItem('currentCalibration');
      }
    }
  };

  const drawLine = (ctx) => {
    if (calibrationLine.start && calibrationLine.end) {
      // Draw main horizontal line
        ctx.beginPath();
      ctx.moveTo(calibrationLine.start.x, calibrationLine.start.y);
      ctx.lineTo(calibrationLine.end.x, calibrationLine.start.y);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();

      // Draw perpendicular lines at endpoints
      const perpLength = 10; // Length of perpendicular lines

      // Left perpendicular line
        ctx.beginPath();
      ctx.moveTo(calibrationLine.start.x, calibrationLine.start.y - perpLength);
      ctx.lineTo(calibrationLine.start.x, calibrationLine.start.y + perpLength);
      ctx.stroke();

      // Right perpendicular line
        ctx.beginPath();
      ctx.moveTo(calibrationLine.end.x, calibrationLine.start.y - perpLength);
      ctx.lineTo(calibrationLine.end.x, calibrationLine.start.y + perpLength);
      ctx.stroke();

      // Draw pixel distance
      const pixelDistance = Math.abs(calibrationLine.end.x - calibrationLine.start.x);
      const midX = (calibrationLine.start.x + calibrationLine.end.x) / 2;
      const midY = calibrationLine.start.y - 20;

      ctx.fillStyle = 'black';
      ctx.fillRect(midX - 40, midY - 15, 80, 20);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.font = '14px Arial';
      ctx.fillText(`${Math.round(pixelDistance)} px`, midX, midY);
    }
  };

  const handleCalibrate = () => {
    if (measurementValue && calibrationLine.start && calibrationLine.end) {
      const pixelDistance = Math.abs(calibrationLine.end.x - calibrationLine.start.x);
      // Calculate pixels per micron (if 40px = 10 microns, then pixels/micron = 40/10 = 4)
      const pixelsPerMicron = pixelDistance / measurementValue;
      
      const calibrationData = {
        magnification,
        calibrationFactor: pixelsPerMicron, // pixels per micron
        unit: 'microns',
        timestamp: new Date().getTime(),
        notes: `${pixelsPerMicron.toFixed(4)} pixels = 1 micron`
      };

      // Save to localStorage
      const existingCalibrations = JSON.parse(localStorage.getItem('calibrations') || '{}');
      existingCalibrations[magnification] = calibrationData;
      localStorage.setItem('calibrations', JSON.stringify(existingCalibrations));
      
      // Update state
      setExistingCalibrations(existingCalibrations);
      setRealScale({ 
        x: pixelsPerMicron,
        y: pixelsPerMicron 
      });

      // Save as current calibration
      localStorage.setItem('currentCalibration', JSON.stringify(calibrationData));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-2xl">
      {/* Header Section */}
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Camera Calibration</h2>
        <p className="text-gray-600">Calibrate your microscope camera for precise measurements</p>
      </div>

      {/* Calibration Type Selection */}
      {!calibrationType && <CalibrationType />}

      {/* Existing Calibrations */}
      {calibrationType === 'existing' && <ExistingCalibrations />}

      {/* New Calibration Controls */}
      {calibrationType === 'new' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Magnification Selection */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">1. Select Magnification</h3>
            <select
              value={magnification}
              onChange={(e) => setMagnification(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-all duration-200"
            >
              <option value="50x">50x</option>
              <option value="100x">100x</option>
              <option value="200x">200x</option>
              <option value="500x">500x</option>
              <option value="1000x">1000x</option>
            </select>
          </div>

        {/* Unit Selection Section */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">2. Select Unit</h3>
          <select 
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-all duration-200"
          >
            <option value="microns">Microns (μm)</option>
            <option value="mm">Millimeters (mm)</option>
            <option value="cm">Centimeters (cm)</option>
          </select>
        </div>

        {/* Measurement Input Section */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">3. Enter Measurement</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              value={measurementValue}
              onChange={(e) => setMeasurementValue(e.target.value)}
              placeholder={`Value in ${unit}`}
              className="flex-1 px-4 py-3 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-all duration-200"
              disabled={!calibrationLine.start || !canDrawLine || lines.length > 0}
            />
            <span className="inline-flex items-center px-3 py-3 text-gray-600 bg-gray-100 rounded-lg">
              {unit}
            </span>
          </div>
        </div>
      </div>
      )}

      {/* Canvas Section */}
      <div className="relative mb-8">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`max-w-full h-auto ${
                canDrawLine ? 'cursor-crosshair' : 'cursor-default'
              }`}
            />
            
            {/* Status Badge */}
            {image && (
              <div className="absolute top-4 right-4">
                {canDrawLine ? (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                    {calibrationLine.start ? '✏️ Enter Measurement' : '✏️ Draw Line'}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
                    ✓ Calibrated
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={handleMeasurementSubmit}
          disabled={!calibrationLine.start || !measurementValue || !canDrawLine}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
            disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200
            flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          Calibrate
        </button>

        <button
          onClick={saveImage}
          disabled={!image}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
            disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200
            flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L12 8m4-4v12" />
          </svg>
          Save Image
        </button>

        <button
          onClick={handleSaveCalibration}
          disabled={!realScale.x}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 
            disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200
            flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Save Calibration
        </button>

        <button
          onClick={resetCalibration}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
            transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
      </div>

      {/* Info Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Measurements Panel */}
        {lines.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Calibration Results</h3>
            <ul className="space-y-3">
              {lines.map((line, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-gray-700">Measurement {index + 1}:</span>
                  <span className="font-medium text-gray-900">
                    {line.measurement.toFixed(2)} {line.unit}
                    <span className="ml-2 text-gray-500 text-sm">
                      ({Math.round(line.pixelDistance)} px)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Image Information Panel */}
        {image && (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Image Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                <span className="text-gray-700">Original Size:</span>
                <span className="font-medium text-gray-900">
                  {originalDimensions.width} × {originalDimensions.height} px
                </span>
              </div>
              {realScale.x && (
                <>
                  <div className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Calibrated Width:</span>
                    <span className="font-medium text-gray-900">
                      {(originalDimensions.width / realScale.x).toFixed(2)} {unit}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Calibrated Height:</span>
                    <span className="font-medium text-gray-900">
                      {(originalDimensions.height / realScale.x).toFixed(2)} {unit}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-700">Scale:</span>
                    <span className="font-medium text-gray-900">
                      1 {unit} = {realScale.x.toFixed(2)} pixels
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions Panel */}
      <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Quick Guide</h3>
        <ol className="space-y-3">
          {[
            "Select your preferred measurement unit",
            "Draw a calibration line by clicking and dragging",
            "Enter the known measurement value",
            "The axes will update to show calibrated measurements",
            "Use 'New Calibration' to start over if needed",
            "Save your calibrated image"
          ].map((step, index) => (
            <li key={index} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-200 text-blue-800 font-medium">
                {index + 1}
              </span>
              <span className="text-blue-800">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <CalibrationInfo realScale={realScale} unit={unit} />
    </div>
  );
};

export default CameraCalibrate; 