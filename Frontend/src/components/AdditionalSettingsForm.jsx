import React, { useState, useEffect } from "react";

const AdditionalSettingsForm = () => {
  // Initialize form data locally in state
  const [localFormData, setLocalFormData] = useState({
    reportType: "custom",
    displayFontSize: 12,
    reportFormat: "Excel",
    darkFeatureMin: 0,
    darkFeatureMax: 128,
    lightFeatureMin: 129,
    lightFeatureMax: 255,
    minPixels: 10,
    circularityCutoff: 0.5,
    minNodularityLength: 10,
  });

  // Fetch saved data from localStorage if available
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("additionalSettingsFormData"));
    if (savedData) {
      setLocalFormData(savedData);
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("additionalSettingsFormData", JSON.stringify(localFormData));
  }, [localFormData]);

  // Update the state whenever form data changes
  const handleInputChangeLocal = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle Save button click
  const handleSave = () => {
    localStorage.setItem("additionalSettingsFormData", JSON.stringify(localFormData));
    alert("Form data saved to localStorage!"); // Optional: Show confirmation message
  };

  return (
    <form className="grid grid-cols-2 gap-6 text-gray-700">
      {/* Custom/Standard Report */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Custom/Standard Report</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="reportType"
              value="custom"
              checked={localFormData.reportType === "custom"}
              onChange={handleInputChangeLocal}
              className="mr-2"
            />
            Custom
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="reportType"
              value="standard"
              checked={localFormData.reportType === "standard"}
              onChange={handleInputChangeLocal}
              className="mr-2"
            />
            Standard
          </label>
        </div>
      </div>

      {/* Display Font Size */}
      <div>
        <label className="block font-medium mb-2">Display Font Size</label>
        <input
          type="number"
          name="displayFontSize"
          value={localFormData.displayFontSize || 12}
          onChange={handleInputChangeLocal}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Report Format */}
      <div>
        <label className="block font-medium mb-2">Report Format</label>
        <select
          name="reportFormat"
          value={localFormData.reportFormat || "Excel"}
          onChange={handleInputChangeLocal}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="Excel">Excel</option>
          <option value="PDF">PDF</option>
          <option value="CSV">CSV</option>
        </select>
      </div>

      {/* Dark/Light Features */}
      <div>
        <label className="block font-medium mb-2">Dark Feature Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            name="darkFeatureMin"
            value={localFormData.darkFeatureMin || 0}
            onChange={handleInputChangeLocal}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            name="darkFeatureMax"
            value={localFormData.darkFeatureMax || 128}
            onChange={handleInputChangeLocal}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Light Feature Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            name="lightFeatureMin"
            value={localFormData.lightFeatureMin || 129}
            onChange={handleInputChangeLocal}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            name="lightFeatureMax"
            value={localFormData.lightFeatureMax || 255}
            onChange={handleInputChangeLocal}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Minimum Pixels for Features */}
      <div>
        <label className="block font-medium mb-2">Minimum Pixels for Features</label>
        <input
          type="number"
          name="minPixels"
          value={localFormData.minPixels || 10}
          onChange={handleInputChangeLocal}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Circularity Cutoff */}
      <div>
        <label className="block font-medium mb-2">
          Circularity Cutoff <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="circularityCutoff"
          value={localFormData.circularityCutoff || 0.5}
          step="0.01"
          min="0.01"
          max="0.99"
          onChange={handleInputChangeLocal}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">(0 and 1)</p>
      </div>

      {/* Minimum Length for Nodularity */}
      <div>
        <label className="block font-medium mb-2">Minimum Length for Nodularity</label>
        <input
          type="number"
          name="minNodularityLength"
          value={localFormData.minNodularityLength || 10}
          onChange={handleInputChangeLocal}
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

export default AdditionalSettingsForm;
