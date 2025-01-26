import React, { useState, useRef, useEffect } from 'react';

const Display = ({ isRecording, imagePath }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [scale, setScale] = useState(1);
  const [imageUrl, setImageUrl] = useState(null);
  const displayRef = useRef(null);

  // Placeholder dimensions - adjust as needed
  const displayStyle = {
    width: '800px',
    height: '600px'
  };

  useEffect(() => {
    if (isRecording) {
      setVideoUrl(`http://localhost:5000/api/video-feed?t=${new Date().getTime()}`);
      setImageUrl(null);
    } else {
      setVideoUrl(null);
    }
  }, [isRecording]);

  useEffect(() => {
    if (imagePath) {
      // Convert Windows path to URL format and fetch the image from the server
      const formattedPath = imagePath.replace(/\\/g, '/');
      fetch(`http://localhost:5000/api/get-image?path=${encodeURIComponent(formattedPath)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch image');
          }
          return response.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        })
        .catch(error => {
          console.error('Error loading image:', error);
          setImageUrl(null);
        });

      // Cleanup previous URL when imagePath changes
      return () => {
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
      };
    }
  }, [imagePath]);

  return (
    <div className="flex-1 flex flex-col items-center p-4">
      {/* Main Display Area */}
      <div 
        ref={displayRef}
        className="relative bg-gray-900 rounded-lg overflow-hidden"
        style={displayStyle}
      >
        {videoUrl ? (
          <img
            src={videoUrl}
            alt="Live Feed"
            className="w-full h-full object-contain"
            style={{ transform: `scale(${scale})` }}
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Captured Image"
            className="w-full h-full object-contain"
            style={{ transform: `scale(${scale})` }}
            onError={(e) => {
              console.error('Error displaying image');
              setImageUrl(null);
            }}
          />
        ) : (
          // Placeholder when no image is loaded
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg 
                className="mx-auto h-12 w-12 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-sm">No image loaded</p>
              <p className="text-xs mt-2">Connect camera to start viewing</p>
            </div>
          </div>
        )}

        {/* Overlay for measurements and annotations (if needed) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Add measurement overlays here */}
        </div>
      </div>

      {/* Scale Indicator */}
      <div className="mt-2 text-sm text-gray-600">
        Scale: {(scale * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default Display;