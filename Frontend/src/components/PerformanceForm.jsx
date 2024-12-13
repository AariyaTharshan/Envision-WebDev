import React from "react";

const PerformanceForm = ({ formData, handleInputChange }) => {
  return (
    <form className="grid grid-cols-2 gap-6 text-gray-700">
      {/* Local Threshold Width */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Local Threshold Width
        </label>
        <input
          type="number"
          name="localThresholdWidth"
          value={formData.localThresholdWidth || 5}
          onChange={(e) => handleInputChange(e, "performance")}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">
          This value determines the width of the window that will be used for local thresholding.
        </p>
      </div>

      {/* Min Pixel Length for Feature */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Min Pixel Length for Feature
        </label>
        <input
          type="number"
          name="minPixelLength"
          value={formData.minPixelLength || 5}
          onChange={(e) => handleInputChange(e, "performance")}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">
          Minimum length in terms of pixels for a feature.
        </p>
      </div>

      {/* Min Pixel Area for Feature */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Min Pixel Area for Feature
        </label>
        <input
          type="number"
          name="minPixelArea"
          value={formData.minPixelArea || 10}
          onChange={(e) => handleInputChange(e, "performance")}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">
          Minimum area in terms of pixels for a feature.
        </p>
      </div>

      {/* Max Process Running Time */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Max Process Running Time
        </label>
        <input
          type="number"
          name="maxRunningTime"
          value={formData.maxRunningTime || 120}
          onChange={(e) => handleInputChange(e, "performance")}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">
          Maximum running time in seconds after which the process will be aborted.
        </p>
      </div>

      {/* Edge Correction Value */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Edge Correction Value
        </label>
        <input
          type="number"
          name="edgeCorrectionValue"
          value={formData.edgeCorrectionValue || 0}
          onChange={(e) => handleInputChange(e, "performance")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Elongation Cutoff */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Elongation Cutoff
        </label>
        <input
          type="number"
          name="elongationCutoff"
          value={formData.elongationCutoff || 0.2}
          onChange={(e) => handleInputChange(e, "performance")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Thresholding (Local/Global) */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Thresholding
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="thresholdingType"
              value="local"
              checked={formData.thresholdingType === "local"}
              onChange={(e) => handleInputChange(e, "performance")}
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
              onChange={(e) => handleInputChange(e, "performance")}
              className="mr-2"
            />
            Global
          </label>
        </div>
      </div>

      {/* Include Global Threshold in Local */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Include Global Threshold in Local?
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="includeGlobalThreshold"
              value="yes"
              checked={formData.includeGlobalThreshold === "yes"}
              onChange={(e) => handleInputChange(e, "performance")}
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
              onChange={(e) => handleInputChange(e, "performance")}
              className="mr-2"
            />
            No
          </label>
        </div>
      </div>

      {/* Sweep Angle for Grain Boundary Gap Fill */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Sweep Angle for Grain Boundary Gap Fill
        </label>
        <input
          type="number"
          name="sweepAngle"
          value={formData.sweepAngle || 120}
          onChange={(e) => handleInputChange(e, "performance")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Min Grain Boundary Width */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Min Grain Boundary Width
        </label>
        <input
          type="number"
          name="minGrainBoundaryWidth"
          value={formData.minGrainBoundaryWidth || 3}
          onChange={(e) => handleInputChange(e, "performance")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </form>
  );
};

export default PerformanceForm;
