import React, { useState, useEffect, useRef } from "react";
import CameraCalibrate from "./CameraCalibrate";
import CameraConfiguration from "./CameraConfiguration";

const Navbar = ({ imagePath, setImagePath, currentImageUrl }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showCalibrate, setShowCalibrate] = useState(false);
  const [showCameraConfig, setShowCameraConfig] = useState(false);
  const dropdownRefs = useRef([]);

  const menuItems = [
    { name: "File", options: ["Clear", "Exit", "Logout", "Save Image"] },
    {
      name: "Settings",
      options: [
        "System Configuration",
        "Calibrate",
        "Camera Configuration",
        "Activate Product",
      ],
    },
    {
      name: "Image",
      options: [
        "Rotate Clockwise",
        "Rotate Anti-Clockwise",
        "Flip Horizontal",
        "Flip Vertical",
        "Zoom In",
        "Zoom Out",
      ],
    },
    {
      name: "Image Process",
      options: [
        "LowPass Filter",
        "Median Filter",
        "Edge Detect Filter",
        "Edge Emphasis",
        "Thresholding",
        "Gray Scale",
        "Invert",
        "Thin",
        "Build Macro",
        "Image Splice",
        "Image Sharpening",
        "Image Stitch",
      ],
    },
    {
      name: "Measurement",
      options: [
        "Porosity",
        "Nodularity",
        "Phases",
        "Grain Size",
        "Inclusion",
        "De-Carburization",
        "Flake Analysis",
        "Dentric Arm Spacing",
        "Particle Analysis",
        "Graphite Classification",
        "Coating Thickness",
        "2D Measurements",
      ],
    },
    { name: "Help", options: ["About", "Help"] },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRefs.current.some(ref => ref && ref.contains(event.target))) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDropdown(index);
    } else if (e.key === 'Escape') {
      setActiveDropdown(null);
    }
  };

  const handleRotate = async (direction) => {
    try {
      if (!imagePath) {
        alert('No image to rotate');
        return;
      }

      console.log('Sending rotation request to server...');
      const response = await fetch('http://localhost:5000/api/rotate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imagePath: imagePath,
          direction: direction
        })
      });

      console.log('Server response received:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Rotation response data:', data);

      if (data.status === 'success') {
        console.log('Setting new image path:', data.filepath);
        setImagePath(data.filepath);
      } else {
        alert('Failed to rotate image: ' + data.message);
      }
    } catch (error) {
      console.error('Error rotating image:', error);
      alert('Error rotating image: ' + error.message);
    }
  };

  const handleFlip = async (direction) => {
    try {
      if (!imagePath) {
        alert('No image to flip');
        return;
      }

      console.log('Sending flip request to server...');
      const response = await fetch('http://localhost:5000/api/flip-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imagePath: imagePath,
          direction: direction
        })
      });

      console.log('Server response received:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Flip response data:', data);

      if (data.status === 'success') {
        console.log('Setting new image path:', data.filepath);
        setImagePath(data.filepath);
      } else {
        alert('Failed to flip image: ' + data.message);
      }
    } catch (error) {
      console.error('Error flipping image:', error);
      alert('Error flipping image: ' + error.message);
    }
  };

  const handleOptionClick = (option) => {
    if (option === "Calibrate") {
      setShowCalibrate(true);
    } else if (option === "Camera Configuration") {
      setShowCameraConfig(true);
    } else if (option === "Rotate Clockwise") {
      handleRotate('clockwise');
    } else if (option === "Rotate Anti-Clockwise") {
      handleRotate('anticlockwise');
    } else if (option === "Flip Horizontal") {
      handleFlip('horizontal');
    } else if (option === "Flip Vertical") {
      handleFlip('vertical');
    }
    setActiveDropdown(null);
  };

  return (
    <>
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                <span className="sr-only">Open main menu</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:block">
              <div className="flex space-x-4">
                {menuItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="relative"
                    ref={el => dropdownRefs.current[index] = el}
                  >
                    <button
                      onClick={() => handleDropdown(index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`px-3 py-2 rounded-md text-sm font-medium 
                        transition-colors duration-200 ease-in-out
                        ${activeDropdown === index 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }
                        focus:outline-none focus:ring-2 focus:ring-offset-2 
                        focus:ring-offset-gray-800 focus:ring-white`}
                      aria-expanded={activeDropdown === index}
                      role="menuitem"
                      tabIndex={0}
                    >
                      {item.name}
                    </button>
                    
                    {activeDropdown === index && (
                      <div 
                        className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 
                          transform transition-all duration-200 ease-in-out z-50"
                        role="menu"
                      >
                        <div className="py-1">
                          {item.options.map((option, optionIndex) => (
                            <a
                              key={optionIndex}
                              href="#"
                              className="block px-4 py-2 text-sm text-gray-700 
                                hover:bg-gray-100 hover:text-gray-900
                                transition-colors duration-150 ease-in-out
                                focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                              onClick={(e) => {
                                e.preventDefault();
                                handleOptionClick(option);
                              }}
                              role="menuitem"
                              tabIndex={0}
                            >
                              {option}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Camera Configuration Modal */}
      {showCameraConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 text-center flex items-center justify-center">
            <div className="fixed inset-0" onClick={() => setShowCameraConfig(false)}></div>
            <div className="inline-block w-auto bg-white shadow-xl rounded-lg relative">
              {/* Close Button */}
              <button
                onClick={() => setShowCameraConfig(false)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <CameraConfiguration />
            </div>
          </div>
        </div>
      )}

      {/* Calibrate Modal */}
      {showCalibrate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0" onClick={() => setShowCalibrate(false)}></div>
            <div className="inline-block w-full max-w-7xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  onClick={() => setShowCalibrate(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CameraCalibrate />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;