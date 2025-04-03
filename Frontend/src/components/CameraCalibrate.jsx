import React, { useState, useRef, useEffect } from 'react';

const CameraCalibrate = ({ imagePath }) => {
  // State variables
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState({ x: 0, y: 0 });
  const [calibrationLine, setCalibrationLine] = useState({ start: null, end: null });
  const [isDrawing, setIsDrawing] = useState(false);
  const [measurementValue, setMeasurementValue] = useState('');
  const [unit, setUnit] = useState('microns');
  const [lines, setLines] = useState([]);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [realScale, setRealScale] = useState({ x: 0, y: 0 });
  const [currentMeasurement, setCurrentMeasurement] = useState(null);
  const [canDrawLine, setCanDrawLine] = useState(true);
  const [calibrationData, setCalibrationData] = useState({
    pixelDistance: 0,
    actualDistance: 0,
    unit: 'mm',
    calibrationFactor: 0
  });
  const [magnification, setMagnification] = useState('100x');
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });
  
  // Refs
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Load camera settings
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
    window.addEventListener('storage', loadCameraSettings);
    return () => window.removeEventListener('storage', loadCameraSettings);
  }, []);

  // Reset calibration
  const resetCalibration = () => {
    setLines([]);
    setCalibrationLine({ start: null, end: null });
    setCanDrawLine(true);
    setMeasurementValue('');
    setRealScale({ x: 0, y: 0 });
    setCurrentMeasurement(null);
  };

  // Initialize canvas
  const initializeCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = resolution.width;
    canvas.height = resolution.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, resolution.width, resolution.height);
  };

  // Draw scale markers
  const drawScaleMarkers = (ctx, width, height) => {
    ctx.strokeStyle = '#333';
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    
    const step = 100;
    
    // Draw X axis scale
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, height - 20);
      ctx.lineTo(x, height - 10);
      ctx.stroke();
      
      if (realScale.x) {
        const realValue = (x / scaleFactor / realScale.x).toFixed(2);
        ctx.fillText(`${realValue} ${unit}`, x - 20, height - 5);
      } else {
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
        const realValue = (y / scaleFactor / realScale.x).toFixed(2);
        ctx.fillText(`${realValue} ${unit}`, 25, y + 5);
      } else {
        ctx.fillText(`${Math.round(y / scaleFactor)}px`, 25, y + 5);
      }
    }
  };

  // Get scaled coordinates
  const getScaledCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  // Save image
  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'calibrated-image.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (!image || !canDrawLine) return;
    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);
    setIsDrawing(true);
    setCalibrationLine({
      start: { x, y },
      end: { x, y },
      measurement: null
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const coords = getScaledCoordinates(e.clientX, e.clientY);
    setCalibrationLine(prev => ({
      ...prev,
      end: { 
        x: coords.x,
        y: prev.start.y
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

  // Handle measurement submit
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

    const pixelsPerUnit = pixelDistance / value;
    setRealScale({ 
      x: pixelsPerUnit,
      y: pixelsPerUnit
    });

    setCalibrationData({
      pixelDistance: pixelDistance,
      actualDistance: value,
      unit: unit,
      calibrationFactor: pixelsPerUnit
    });

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
    
    const ctx = canvasRef.current.getContext('2d');
    drawImage();
    drawLine(ctx);
  };

  // Calculate real-time measurement
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

  // Draw scale bar
  const drawScaleBar = (ctx, width, height) => {
    if (!realScale.x) return;

    const scaleBarLength = 100;
    const realDistance = (scaleBarLength / scaleFactor / realScale.x).toFixed(2);
    
    // Draw scale bar
    ctx.beginPath();
    ctx.moveTo(width - scaleBarLength - 20, height - 30);
    ctx.lineTo(width - 20, height - 30);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw perpendicular lines
    ctx.beginPath();
    ctx.moveTo(width - scaleBarLength - 20, height - 35);
    ctx.lineTo(width - scaleBarLength - 20, height - 25);
    ctx.moveTo(width - 20, height - 35);
    ctx.lineTo(width - 20, height - 25);
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${realDistance} ${unit}`, width - scaleBarLength/2 - 20, height - 15);
  };

  // Draw calibration line
  const drawLine = (ctx) => {
    if (calibrationLine.start && calibrationLine.end) {
      ctx.beginPath();
      ctx.moveTo(calibrationLine.start.x, calibrationLine.start.y);
      ctx.lineTo(calibrationLine.end.x, calibrationLine.start.y);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();

      const perpLength = 10;
      ctx.beginPath();
      ctx.moveTo(calibrationLine.start.x, calibrationLine.start.y - perpLength);
      ctx.lineTo(calibrationLine.start.x, calibrationLine.start.y + perpLength);
      ctx.moveTo(calibrationLine.end.x, calibrationLine.start.y - perpLength);
      ctx.lineTo(calibrationLine.end.x, calibrationLine.start.y + perpLength);
      ctx.stroke();

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

  // Draw image
  const drawImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    drawScaleMarkers(ctx, canvas.width, canvas.height);
    drawScaleBar(ctx, canvas.width, canvas.height);
  };

  // Handle unit change
  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    if (realScale.x) {
      const conversionFactor = {
        microns: 1,
        mm: 1000,
        cm: 10000
      };
      const factor = conversionFactor[newUnit] / conversionFactor[unit];
      setRealScale({
        x: realScale.x * factor,
        y: realScale.y * factor
      });
    }
  };

  // Load image
  useEffect(() => {
    if (imagePath) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setOriginalDimensions({
          width: img.width,
          height: img.height
        });
        initializeCanvas(img);
      };
      img.src = imagePath;
    }
  }, [imagePath]);

  // Redraw on image or scale changes
  useEffect(() => {
    if (image) {
      drawImage();
      if (calibrationLine.start) {
        const ctx = canvasRef.current.getContext('2d');
        drawLine(ctx);
      }
    }
  }, [image, realScale, unit]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Camera Calibration</h1>
          <p className="text-gray-600 mt-1">Calibrate your microscope camera for precise measurements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calibration Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Magnification</label>
                    <select
                      value={magnification}
                      onChange={(e) => setMagnification(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="50x">50x</option>
                      <option value="100x">100x</option>
                      <option value="200x">200x</option>
                      <option value="500x">500x</option>
                      <option value="1000x">1000x</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={unit}
                      onChange={(e) => handleUnitChange(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="microns">Microns (μm)</option>
                      <option value="mm">Millimeters (mm)</option>
                      <option value="cm">Centimeters (cm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Value</label>
                    <div className="flex rounded-lg overflow-hidden">
                      <input
                        type="number"
                        value={measurementValue}
                        onChange={(e) => setMeasurementValue(e.target.value)}
                        placeholder={`Value in ${unit}`}
                        className="flex-1 px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                        disabled={!calibrationLine.start || !canDrawLine || lines.length > 0}
                      />
                      <span className="px-4 py-2 bg-gray-50 border border-l-0 border-gray-300 text-gray-600">
                        {unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleMeasurementSubmit}
                    disabled={!calibrationLine.start || !measurementValue || !canDrawLine}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    Calibrate
                  </button>
                  <button
                    onClick={saveImage}
                    disabled={!image}
                    className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L12 8m4-4v12" />
                    </svg>
                    Save Image
                  </button>
                  <button
                    onClick={resetCalibration}
                    className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
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
          </div>
        </div>

        {/* Bottom Section - Info */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Measurements Panel */}
          {lines.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calibration Results</h3>
                <ul className="space-y-3">
                  {lines.map((line, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
            </div>
          )}

          {/* Image Information Panel */}
          {image && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Original Size:</span>
                    <span className="font-medium text-gray-900">
                      {originalDimensions.width} × {originalDimensions.height} px
                    </span>
                  </div>
                  {realScale.x && (
                    <>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Calibrated Width:</span>
                        <span className="font-medium text-gray-900">
                          {(originalDimensions.width / realScale.x).toFixed(2)} {unit}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Calibrated Height:</span>
                        <span className="font-medium text-gray-900">
                          {(originalDimensions.height / realScale.x).toFixed(2)} {unit}
                        </span>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-semibold text-blue-900 mb-3">Scale Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-800">1 {unit} =</span>
                            <span className="font-medium text-blue-900">{realScale.x.toFixed(4)} pixels</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-800">1 pixel =</span>
                            <span className="font-medium text-blue-900">{(1/realScale.x).toFixed(4)} {unit}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-800">Scale Factor:</span>
                            <span className="font-medium text-blue-900">{realScale.x.toFixed(4)} pixels/{unit}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCalibrate;