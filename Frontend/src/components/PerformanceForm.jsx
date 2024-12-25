import React, { useState, useEffect } from "react";

const PerformanceForm = () => {
  // Initializing the form data state, trying to get it from localStorage if available.
  const [formData, setFormData] = useState(() => {
    const savedData = JSON.parse(localStorage.getItem("performanceFormData"));
    return savedData || {
      localThresholdWidth: 5,
      minPixelLength: 5,
      minPixelArea: 10,
      maxRunningTime: 120,
      edgeCorrectionValue: 0,
      elongationCutoff: 0.2,
      thresholdingType: "local",
      includeGlobalThreshold: "yes",
      sweepAngle: 120,
      minGrainBoundaryWidth: 3,
    };
  });

  // Update formData in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("performanceFormData", JSON.stringify(formData));
  }, [formData]);

  // Handle input changes and update the form data
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "radio" ? checked ? value : formData[name] : value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  // Save function to explicitly save data to localStorage
  const handleSave = () => {
    localStorage.setItem("performanceFormData", JSON.stringify(formData));
    alert("Data saved successfully!");
  };

  return (
    <form className="grid grid-cols-2 gap-6 text-gray-700">
      {/* Local Threshold Width */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Local Threshold Width</label>
        <input
          type="number"
          name="localThresholdWidth"
          value={formData.localThresholdWidth || 5}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">
          This value determines the width of the window that will be used for local thresholding.
        </p>
      </div>

      {/* Min Pixel Length for Feature */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Min Pixel Length for Feature</label>
        <input
          type="number"
          name="minPixelLength"
          value={formData.minPixelLength || 5}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">
          Minimum length in terms of pixels for a feature.
        </p>
      </div>

      {/* Min Pixel Area for Feature */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Min Pixel Area for Feature</label>
        <input
          type="number"
          name="minPixelArea"
          value={formData.minPixelArea || 10}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">
          Minimum area in terms of pixels for a feature.
        </p>
      </div>

      {/* Max Process Running Time */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Max Process Running Time</label>
        <input
          type="number"
          name="maxRunningTime"
          value={formData.maxRunningTime || 120}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">
          Maximum running time in seconds after which the process will be aborted.
        </p>
      </div>

      {/* Edge Correction Value */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Edge Correction Value</label>
        <input
          type="number"
          name="edgeCorrectionValue"
          value={formData.edgeCorrectionValue || 0}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Elongation Cutoff */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Elongation Cutoff</label>
        <input
          type="number"
          name="elongationCutoff"
          value={formData.elongationCutoff || 0.2}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Thresholding (Local/Global) */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Thresholding</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="thresholdingType"
              value="local"
              checked={formData.thresholdingType === "local"}
              onChange={handleInputChange}
              className="mr-2"
            />
            Local
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="thresholdingType"
              value="global"
              checked={formData.thresholdingType === "global"}
              onChange={handleInputChange}
              className="mr-2"
            />
            Global
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="thresholdingType"
              value="binary"
              checked={formData.thresholdingType === "binary"}
              onChange={handleInputChange}
              className="mr-2"
            />
            Binary
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="thresholdingType"
              value="adaptive"
              checked={formData.thresholdingType === "adaptive"}
              onChange={handleInputChange}
              className="mr-2"
            />
            Adaptive
          </label>
        </div>
      </div>

      {/* Include Global Threshold in Local? */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Include Global Threshold in Local?</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="includeGlobalThreshold"
              value="yes"
              checked={formData.includeGlobalThreshold === "yes"}
              onChange={handleInputChange}
              className="mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="includeGlobalThreshold"
              value="no"
              checked={formData.includeGlobalThreshold === "no"}
              onChange={handleInputChange}
              className="mr-2"
            />
            No
          </label>
        </div>
      </div>

      {/* Sweep Angle for Grain Boundary Gap Fill */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Sweep Angle for Grain Boundary Gap Fill</label>
        <input
          type="number"
          name="sweepAngle"
          value={formData.sweepAngle || 120}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Min Grain Boundary Width */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Min Grain Boundary Width</label>
        <input
          type="number"
          name="minGrainBoundaryWidth"
          value={formData.minGrainBoundaryWidth || 3}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Save Button */}
      <div className="col-span-2 flex justify-end text-center mt-6">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default PerformanceForm;
