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

  const DISPLAY_WIDTH = 800; // Fixed display width in pixels

  // Add reset calibration function
  const resetCalibration = () => {
    setLines([]);
    setCalibrationLine({ start: null, end: null });
    setCanDrawLine(true);
    setMeasurementValue('');
    setRealScale({ x: 0, y: 0 });
    setCurrentMeasurement(null);
  };

  // Modified initializeCanvas
  const initializeCanvas = (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to fixed display dimensions
    const displayHeight = (img.height / img.width) * DISPLAY_WIDTH;
    canvas.width = DISPLAY_WIDTH;
    canvas.height = displayHeight;
    
    // Draw scaled image
    ctx.drawImage(img, 0, 0, DISPLAY_WIDTH, displayHeight);
    
    // Draw scale markers
    drawScaleMarkers(ctx, DISPLAY_WIDTH, displayHeight);
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

  // Modified mouse event handlers to account for scaling
  const getScaledCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left);
    const y = (clientY - rect.top);
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

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const { x } = getScaledCoordinates(e.clientX, e.clientY);
    // Keep y coordinate same as start point for horizontal line
    setCalibrationLine(prev => ({
        ...prev,
        end: { 
            x: x,  // Update only x coordinate
            y: prev.start.y  // Keep y coordinate same as start point
        }
    }));

    // Redraw canvas
    const ctx = canvasRef.current.getContext('2d');
    drawImage();
    drawLine(ctx);
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

  // Modify the drawing useEffect for lines
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const displayHeight = (image.height / image.width) * DISPLAY_WIDTH;
    ctx.drawImage(imageRef.current, 0, 0, DISPLAY_WIDTH, displayHeight);
    
    // Draw pixel dimensions
    ctx.strokeStyle = '#333';
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    
    // Draw original image dimensions
    const originalWidth = Math.round(originalDimensions.width);
    const originalHeight = Math.round(originalDimensions.height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 45);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Original: ${originalWidth} × ${originalHeight} px`, 20, 30);
    ctx.fillText(`Display: ${Math.round(DISPLAY_WIDTH)} × ${Math.round(displayHeight)} px`, 20, 45);

    // Draw scale bar if calibrated
    if (realScale.x) {
      drawScaleBar(ctx, canvas.width, canvas.height);
    }
    
    // Draw all saved lines
    lines.forEach(line => {
      ctx.beginPath();
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.stroke();

      // Draw measurement label with real units and original pixels
      const midX = (line.start.x + line.end.x) / 2;
      const midY = (line.start.y + line.end.y) / 2;
      ctx.fillStyle = '#00FF00';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(
        `${line.measurement.toFixed(2)} ${line.unit} (${Math.round(line.pixelDistance)} px)`, 
        midX + 10, 
        midY - 10
      );
    });
    
    // Draw current calibration line with original pixel length
    if (calibrationLine.start && calibrationLine.end) {
      ctx.beginPath();
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.moveTo(calibrationLine.start.x, calibrationLine.start.y);
      ctx.lineTo(calibrationLine.end.x, calibrationLine.end.y);
      ctx.stroke();

      // Calculate and show original pixel distance while drawing
      const pixelDistance = calculatePixelDistance(calibrationLine.start, calibrationLine.end);
      if (pixelDistance) {
        const midX = (calibrationLine.start.x + calibrationLine.end.x) / 2;
        const midY = (calibrationLine.start.y + calibrationLine.end.y) / 2;
        ctx.fillStyle = '#FF0000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        // Show real measurement if calibrated
        if (currentMeasurement) {
          ctx.fillText(
            `${currentMeasurement} ${unit} (${Math.round(pixelDistance)} px)`, 
            midX + 10, 
            midY - 10
          );
        } else {
          // Show only original pixels if not calibrated yet
          ctx.fillText(
            `${Math.round(pixelDistance)} px`, 
            midX + 10, 
            midY - 10
          );
        }
      }
    }
  }, [image, calibrationLine, lines, currentMeasurement, unit, realScale, originalDimensions]);

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

  const handleSaveCalibration = async () => {
    try {
      if (!calibrationData.calibrationFactor) {
        alert('Please perform calibration first');
        return;
      }

      console.log('Sending calibration data to server...');
      const response = await fetch('http://localhost:5000/api/save-calibration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          calibrationData: {
            ...calibrationData,
            timestamp: new Date().toISOString()
          }
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

  useEffect(() => {
    if (imagePath) {
      const img = new Image();
      img.onload = () => {
        // Store original dimensions
        setOriginalDimensions({ width: img.width, height: img.height });
        
        // Calculate scale factor
        const newScaleFactor = DISPLAY_WIDTH / img.width;
        setScaleFactor(newScaleFactor);
        
        setImage(img);
        imageRef.current = img;
        initializeCanvas(img);
      };
      img.src = `http://localhost:5000/api/get-image?path=${encodeURIComponent(imagePath)}`;
    }
  }, [imagePath]); // Update when imagePath changes

  const drawLine = (ctx) => {
    if (calibrationLine.start && calibrationLine.end) {
        ctx.beginPath();
        ctx.moveTo(
            calibrationLine.start.x * scaleFactor,
            calibrationLine.start.y * scaleFactor
        );
        ctx.lineTo(
            calibrationLine.end.x * scaleFactor,
            calibrationLine.start.y * scaleFactor  // Use start.y for horizontal line
        );
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw endpoints
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(
            calibrationLine.start.x * scaleFactor,
            calibrationLine.start.y * scaleFactor,
            4, 0, 2 * Math.PI
        );
        ctx.fill();
        ctx.beginPath();
        ctx.arc(
            calibrationLine.end.x * scaleFactor,
            calibrationLine.start.y * scaleFactor,  // Use start.y for horizontal line
            4, 0, 2 * Math.PI
        );
        ctx.fill();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-2xl">
      {/* Header Section */}
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Camera Calibration</h2>
        <p className="text-gray-600">Calibrate your microscope camera for precise measurements</p>
      </div>

      {/* Main Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Unit Selection Section */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">1. Select Unit</h3>
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
          <h3 className="text-lg font-semibold mb-4 text-gray-700">2. Enter Measurement</h3>
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