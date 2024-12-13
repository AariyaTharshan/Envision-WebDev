import React, { useState } from 'react';

const CameraCalibrate = ({ onClose }) => {
  const [calibrationData, setCalibrationData] = useState({
    magnification: '',
    name: '',
    unit: 'microns',
    xAxisCalibration: '0.0 microns',
    yAxisCalibration: '0.0 microns',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCalibrationData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUnitChange = (e) => {
    setCalibrationData((prevData) => ({
      ...prevData,
      unit: e.target.value,
    }));
  };

  const handleSave = () => {
    console.log('Saving calibration data', calibrationData);
    // Logic to save the calibration data
  };

  const handleDelete = () => {
    setCalibrationData({
      magnification: '',
      name: '',
      unit: 'microns',
      xAxisCalibration: '0.0 microns',
      yAxisCalibration: '0.0 microns',
    });
    console.log('Deleted calibration data');
  };

  const handleNewCalibration = () => {
    setCalibrationData({
      magnification: '',
      name: '',
      unit: 'microns',
      xAxisCalibration: '0.0 microns',
      yAxisCalibration: '0.0 microns',
    });
    console.log('Starting new calibration');
  };

  const handleClose = () => {
    onClose(); // Close the popover logic
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-xs w-full">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Camera Calibration</h2>

        <form className="space-y-4 text-gray-700">
          {/* Magnification Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Magnification</label>
            <input
              type="number"
              name="magnification"
              value={calibrationData.magnification}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name (Optional)</label>
            <input
              type="text"
              name="name"
              value={calibrationData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Unit Radio Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <div className="flex space-x-3 text-sm">
              {['mm', 'cm', 'inch', 'microns'].map((unit) => (
                <div key={unit} className="flex items-center">
                  <input
                    type="radio"
                    id={unit}
                    name="unit"
                    value={unit}
                    checked={calibrationData.unit === unit}
                    onChange={handleUnitChange}
                    className="mr-2"
                  />
                  <label htmlFor={unit} className="text-gray-700">{unit}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Calibration Values */}
          <div className="mt-2 text-sm text-gray-600">
            <p>X Axis: {calibrationData.xAxisCalibration}</p>
            <p>Y Axis: {calibrationData.yAxisCalibration}</p>
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleNewCalibration}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              New
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CameraCalibrate;
