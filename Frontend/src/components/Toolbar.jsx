import React, { useState } from 'react';
import { 
  FaMousePointer, 
  FaEraser,
  FaDotCircle,
  FaRuler,
  FaSquare,
  FaCircle,
  FaDrawPolygon,
  FaBezierCurve,
  FaVectorSquare,
  FaTrash
} from 'react-icons/fa';

const Toolbar = ({ onSelectTool, selectedTool, measurementData, onClearShapes }) => {
  const [showTooltip, setShowTooltip] = useState(null);
  
  // Group tools by category for better organization
  const toolGroups = [
    {
      name: 'Basic',
      tools: [
        { id: 'pointer', icon: <FaMousePointer />, label: 'Select', description: 'Select or move objects' },
        { id: 'point', icon: <FaDotCircle />, label: 'Point', description: 'Place a point marker' },
        { id: 'eraser', icon: <FaEraser />, label: 'Eraser', description: 'Erase measurements' },
      ]
    },
    {
      name: 'Measurement',
      tools: [
        { id: 'line', icon: <FaRuler />, label: 'Line', description: 'Measure linear distance' },
        { id: 'rectangle', icon: <FaSquare />, label: 'Rectangle', description: 'Measure area with rectangle' },
        { id: 'circle', icon: <FaCircle />, label: 'Circle', description: 'Measure circular area' },
      ]
    },
    {
      name: 'Advanced',
      tools: [
        { id: 'arc', icon: <FaDrawPolygon />, label: 'Arc', description: 'Draw an arc' },
        { id: 'curve', icon: <FaBezierCurve />, label: 'Curve', description: 'Draw a curve' },
        { id: 'closedCurve', icon: <FaVectorSquare />, label: 'Closed Curve', description: 'Draw a closed curve' },
      ]
    }
  ];

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-1">
        {/* Tool Groups */}
        <div className="flex space-x-4">
          {toolGroups.map((group) => (
            <div key={group.name} className="flex items-center">
              <div className="flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded-lg">
                <span className="text-xs font-medium text-gray-500 mr-2">{group.name}</span>
                <div className="flex space-x-1">
                  {group.tools.map((tool) => (
                    <div key={tool.id} className="relative">
                      <button
                        onClick={() => onSelectTool(tool.id)}
                        onMouseEnter={() => setShowTooltip(tool.id)}
                        onMouseLeave={() => setShowTooltip(null)}
                        className={`p-1.5 rounded-md transition-all duration-200 relative
                          ${selectedTool === tool.id 
                            ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm' 
                            : 'hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        <span className="text-lg">{tool.icon}</span>
                      </button>
                      
                      {/* Enhanced Tooltip */}
                      {showTooltip === tool.id && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 z-50">
                          <div className="bg-gray-800 text-white px-2 py-1 rounded-md text-sm shadow-lg">
                            <p className="font-medium">{tool.label}</p>
                            <p className="text-xs text-gray-300">{tool.description}</p>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Clear Button */}
          <div className="flex items-center">
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded-lg">
              <span className="text-xs font-medium text-gray-500 mr-2">Actions</span>
              <div className="flex space-x-1">
                <button
                  onClick={onClearShapes}
                  onMouseEnter={() => setShowTooltip('clear')}
                  onMouseLeave={() => setShowTooltip(null)}
                  className="p-1.5 rounded-md transition-all duration-200 hover:bg-red-100 text-red-600"
                >
                  <span className="text-lg"><FaTrash /></span>
                </button>
                
                {/* Tooltip for Clear button */}
                {showTooltip === 'clear' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 z-50">
                    <div className="bg-gray-800 text-white px-2 py-1 rounded-md text-sm shadow-lg">
                      <p className="font-medium">Clear All</p>
                      <p className="text-xs text-gray-300">Remove all measurements</p>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                )}
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Help */}
      <div className="px-4 py-1 bg-blue-50 text-xs text-blue-700 border-t border-blue-100">
        <span className="font-medium">Tip:</span> Select a tool to start. Press ESC to cancel current action.
      </div>
    </div>
  );
};

export default Toolbar; 