import React, { useState } from "react";

const PopupModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Camera Configuration</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Resolution</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>640x480</option>
                <option>800x600</option>
                <option>1024x768</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Camera Window Width
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Width in cm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Camera Window Height
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Height in cm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Preview</label>
              <div className="border border-gray-300 rounded h-20 flex items-center justify-center">
                <span className="text-gray-500">Preview Area</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Camera Type</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Type"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => alert("Saved!")}
              >
                Save
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PopupModal;