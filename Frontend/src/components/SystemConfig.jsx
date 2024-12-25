import React, { useState } from "react";
import General from './GeneralForm';
import General1 from './AdditionalSettingsForm';
import Performance from './PerformanceForm';
import Flake from './Flakeconfiguration';

const SystemConfig = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("General");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 overflow-y-auto max-h-screen">
        <h2 className="text-2xl text-gray-700 font-bold mb-4">System Configuration</h2>

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
              activeTab === "General1" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
            }`}
            onClick={() => handleTabChange("General1")}
          >
            General-1
          </button>
          <button
            className={`px-6 py-2 font-medium text-lg ${
              activeTab === "Performance" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
            }`}
            onClick={() => handleTabChange("Performance")}
          >
            Performance
          </button>
          <button
            className={`px-6 py-2 font-medium text-lg ${
              activeTab === "Flake" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
            }`}
            onClick={() => handleTabChange("Flake")}
          >
            Flake Configuration
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "General" && <General />}
        {activeTab === "General1" && <General1 />}
        {activeTab === "Performance" && <Performance />}
        {activeTab === "Flake" && <Flake />}

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
