import React, { useState } from "react";
import SystemConfig from "./SystemConfig"; // Import the SystemConfig component

const Navbar = () => {
  const [showConfig, setShowConfig] = useState(false); // State to manage modal visibility
  const [dropdownOpen, setDropdownOpen] = useState(null); // State to manage dropdown visibility

  // Function to toggle dropdown
  const toggleDropdown = (menu) => {
    setDropdownOpen(dropdownOpen === menu ? null : menu);
  };

  // Function to handle option click (open System Config modal)
  const handleOptionClick = (option) => {
    if (option === "System Configuration") {
      setShowConfig(true); // Show System Configuration modal
    } else {
      console.log(`Option clicked: ${option}`);
    }
    setDropdownOpen(null); // Close the dropdown after an option is clicked
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left - Navbar Items */}
          <div className="flex space-x-4">
            {[
              { name: "File", options: ["Clear", "Exit", "Logout", "Save Image"] },
              { name: "Settings", options: ["System Configuration", "Calibrate", "Camera Configuration", "Activate Product"] },
              { name: "Image", options: ["Camera Play", "Camera Setup", "Camera Resolution", "Save Params", "Rotate Clockwise", "Rotate Anti-Clockwise", "Flip Horizontal", "Flip Vertical", "Zoom"] },
              { name: "Image Process", options: ["LowPass Filter", "Median Filter", "Edge Detect Filter", "Edge Emphasis", "Thresholding", "Gray Scale", "Invert", "Thin", "Build Macro", "Image Splice", "Image Sharpening", "Image Stitch"] },
              { name: "Measurement", options: ["Porosity", "Nodularity", "Phases", "Grain Size", "Inclusion", "De-Carburization", "Flake Analysis", "Dentric Arm Spacing", "Particle Analysis", "Graphite Classification", "Coating Thickness", "2D Measurements"] },
              { name: "Help", options: ["About", "Help"] },
            ].map((menu) => (
              <div key={menu.name} className="relative">
                <button
                  onClick={() => toggleDropdown(menu.name)}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  {menu.name}
                </button>
                {dropdownOpen === menu.name && (
                  <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                    <ul className="py-1 text-gray-800">
                      {menu.options.map((option, index) => (
                        <li key={index}>
                          <a
                            className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => handleOptionClick(option)} // Handle click
                          >
                            {option}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right - Heading */}
          <div className="text-xl font-semibold">Envision</div>
        </div>
      </div>

      {/* Show the System Configuration Modal when triggered */}
      {showConfig && (
        <SystemConfig onClose={() => setShowConfig(false)} /> // Pass the close function to the modal
      )}
    </nav>
  );
};

export default Navbar;
