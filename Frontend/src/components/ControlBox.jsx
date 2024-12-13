import React, { useState } from "react";
import { FaRecordVinyl, FaCamera, FaUpload, FaFolderOpen } from "react-icons/fa";
import { SiReact } from "react-icons/si";

const ControlBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState("");

  const handleChooseLocation = () => {
    // Create a file input to simulate system's file picker dialog
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.webkitdirectory = true; // Enables directory selection
    fileInput.onchange = (event) => {
      const chosenLocation = event.target.files[0]?.path || "C:/User/Documents"; // Selects the first file path
      setLocation(chosenLocation);
    };
    fileInput.click(); // Open the file picker
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Toggle Button (Open/Close) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none transition-all"
        aria-label={isOpen ? "Close Control Box" : "Open Control Box"}
      >
        {isOpen ? (
          <FaFolderOpen className="text-2xl" />
        ) : (
          <SiReact className="text-2xl" />
        )}
      </button>

      {/* Control Box */}
      {isOpen && (
        <div className="mt-4 bg-gray-900 rounded-lg shadow-xl p-6 w-full sm:w-80 md:w-full max-w-l">
          {/* Title */}
          <h2 className="text-xl text-white font-semibold mb-4">Control Box</h2>

          {/* Buttons with Icons */}
          <div className="flex justify-around mb-6">
            <div className="flex flex-col items-center">
              <button
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-500 transition-all"
                title="Record"
                aria-label="Start Recording"
              >
                <FaRecordVinyl className="text-2xl" />
              </button>
              <span className="text-sm text-white mt-2">Record</span>
            </div>
            <div className="flex flex-col items-center">
              <button
                className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-500 transition-all"
                title="Snap"
                aria-label="Take a Snapshot"
              >
                <FaCamera className="text-2xl" />
              </button>
              <span className="text-sm text-white mt-2">Snap</span>
            </div>
            <div className="flex flex-col items-center">
              <button
                className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-500 transition-all"
                title="Import"
                aria-label="Import Files"
              >
                <FaUpload className="text-2xl" />
              </button>
              <span className="text-sm text-white mt-2">Import</span>
            </div>
          </div>

          {/* Magnification and Location in one line */}
          <div className="flex mb-6 gap-4">
            <div className="flex-1">
              <label htmlFor="magnification" className="text-white mb-2 block">
                Magnification
              </label>
              <select
                id="magnification"
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="10x">10x</option>
                <option value="1000x">1000x</option>
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="location" className="text-white mb-2 block">
                Location
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="location"
                  value={location}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-l-lg"
                  placeholder="Select Location"
                />
                <button
                  onClick={handleChooseLocation}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-500 transition-all"
                  aria-label="Choose Location"
                >
                  <FaFolderOpen className="text-2xl" />
                </button>
              </div>
            </div>
          </div>

          {/* Date Range Inputs in another line */}
          <div className="flex mb-6 gap-4">
            <div className="flex-1">
              <label htmlFor="fromDate" className="text-white mb-2 block">
                From Date
              </label>
              <input
                type="date"
                id="fromDate"
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="toDate" className="text-white mb-2 block">
                To Date
              </label>
              <input
                type="date"
                id="toDate"
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlBox;
