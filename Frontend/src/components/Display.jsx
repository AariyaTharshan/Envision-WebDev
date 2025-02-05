import React, { useState, useRef, useEffect } from 'react';

const Display = ({ isRecording, imagePath, onImageLoad }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const displayRef = useRef(null);
  const prevImagePathRef = useRef(imagePath);

  useEffect(() => {
    if (isRecording) {
      setVideoUrl(`http://localhost:5000/api/video-feed?t=${new Date().getTime()}`);
      setImageUrl(null);
    } else {
      setVideoUrl(null);
    }
  }, [isRecording]);

  useEffect(() => {
    // Only fetch if imagePath has changed
    if (imagePath && imagePath !== prevImagePathRef.current) {
      prevImagePathRef.current = imagePath;
      
      const formattedPath = imagePath.replace(/\\/g, '/');
      fetch(`http://localhost:5000/api/get-image?path=${encodeURIComponent(formattedPath)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch image');
          }
          return response.blob();
        })
        .then(blob => {
          // Revoke previous URL if it exists
          if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
          }
          const newUrl = URL.createObjectURL(blob);
          setImageUrl(newUrl);
          if (onImageLoad) {
            onImageLoad(newUrl);
          }
        })
        .catch(error => {
          console.error('Error loading image:', error);
          setImageUrl(null);
        });
    }

    // Cleanup function to revoke object URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imagePath]); // Remove onImageLoad from dependencies

  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-64px)]">
      <div className="relative w-[800px] h-[600px] flex items-center justify-center">
        {videoUrl ? (
          <img
            src={videoUrl}
            alt="Live Feed"
            className="max-w-full max-h-full"
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Captured Image"
            className="max-w-full max-h-full"
            onError={(e) => {
              console.error('Error displaying image');
              setImageUrl(null);
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Display;