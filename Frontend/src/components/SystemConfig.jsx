import React, { useState } from "react";
import GeneralForm from "./GeneralForm";
import PerformanceForm from "./PerformanceForm"; // Ensure it's imported

const SystemConfig = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("General");
  const [formData, setFormData] = useState({
    general: {
      companyName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      numImages: 1,
      imageResolution: 1920,
      decimalPoints: 2,
      scaleLength: 100,
      fontSize: 12,
      reportHeader: true,
      reportType:"standard",
      imageInReport: "original",
      darkFeatureRangeMin: 0,
      darkFeatureRangeMax: 128,
      lightFeatureRangeMin: 129,
      lightFeatureRangeMax: 255,
      minPixelsForFeatures: 10,
      nodularity: 10,
      circularityCutoff: 0.5,
      minLengthForNodularity: 10,
    },
    performance: {
      maxPixelThreshold: 100,
      minFeatureArea: 5,
    },
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [name]: value,
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 overflow-y-auto max-h-screen">
        <h2 className="text-2xl text-gray-700 font-bold mb-4">System Configuration</h2>
        <p className="text-red-600 text-sm mb-6">
          PLEASE DO NOT CHANGE THE VALUES IN THIS TAB WITHOUT CONSULTING TECHNICAL SUPPORT
        </p>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b-2 border-gray-300">
          <button
            className={`px-6 py-2 font-medium text-lg ${
              activeTab === "General" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
            }`}
            onClick={() => handleTabChange("General")}
          >
            General
          </button>
          <button
            className={`px-6 py-2 font-medium text-lg ${
              activeTab === "Performance" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
            }`}
            onClick={() => handleTabChange("Performance")}
          >
            Performance
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "General" && (
          <GeneralForm formData={formData.general} handleInputChange={handleInputChange} />
        )}
        {activeTab === "Performance" && (
          <PerformanceForm formData={formData.performance} handleInputChange={handleInputChange} />
        )}

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
