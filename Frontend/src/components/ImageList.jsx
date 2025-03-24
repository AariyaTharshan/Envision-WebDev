import React, { useState, useEffect, useCallback } from 'react';
import { FaTrash } from 'react-icons/fa';

const ImageList = ({ currentPath, onSelectImage, onDeleteImage }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Add polling interval state (default 5 seconds)
  const POLL_INTERVAL = 5000;

  // Memoize loadImages to prevent unnecessary recreations
  const loadImages = useCallback(async () => {
    if (!currentPath) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/list-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          path: currentPath,
          filters: {
            extensions: ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
          }
        })
      });

      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.images)) {
        // Compare with current images to avoid unnecessary updates
        const newImages = data.images.map(img => ({
          ...img,
          path: img.path,
          name: img.name,
          date: new Date(img.date),
          size: img.size,
          thumbnail: `http://localhost:5000/api/thumbnail?path=${encodeURIComponent(img.path)}`
        }));

        // Only update if images have changed
        setImages(prevImages => {
          const hasChanged = JSON.stringify(prevImages.map(i => i.path)) !== 
                            JSON.stringify(newImages.map(i => i.path));
          return hasChanged ? newImages : prevImages;
        });
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  // Initial load and path change handler
  useEffect(() => {
    if (currentPath) {
      setLoading(true);
      loadImages();
    }
  }, [currentPath, loadImages]);

  // Set up polling for updates
  useEffect(() => {
    if (!currentPath) return;

    // Initial load
    loadImages();

    // Set up polling interval
    const intervalId = setInterval(loadImages, POLL_INTERVAL);

    // Cleanup on unmount or path change
    return () => {
      clearInterval(intervalId);
    };
  }, [currentPath, loadImages]);

  // Add folder watch setup
  useEffect(() => {
    const setupFolderWatch = async () => {
      if (!currentPath) return;

      try {
        // Set up folder watch on the backend
        const response = await fetch('http://localhost:5000/api/watch-folder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path: currentPath })
        });

        if (!response.ok) {
          console.error('Failed to set up folder watch');
        }
      } catch (error) {
        console.error('Error setting up folder watch:', error);
      }
    };

    setupFolderWatch();
  }, [currentPath]);

  const handleImageClick = (image) => {
    setSelectedImage(image.path);
    if (onSelectImage) {
      onSelectImage(image.path);
    }
  };

  const handleDeleteClick = async (image, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${image.name}?`)) {
      try {
        const response = await fetch('http://localhost:5000/api/delete-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path: image.path })
        });

        const data = await response.json();
        if (data.status === 'success') {
          loadImages();
          if (onDeleteImage) {
            onDeleteImage(image.path);
          }
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Image Gallery</h3>
      </div>
      
      <div className="overflow-x-auto overflow-y-hidden" style={{ height: 'calc(280px - 48px)' }}>
        <div className="flex gap-4 p-4 min-w-max">
          {loading ? (
            <div className="flex items-center justify-center p-4 w-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-4 text-gray-500 w-full">
              No images found in this folder
            </div>
          ) : (
            images.map((image) => (
              <div
                key={image.path}
                onClick={() => handleImageClick(image)}
                className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all
                  ${selectedImage === image.path ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                  border border-gray-200 w-[120px] flex-shrink-0`}
              >
                <div className="relative w-[100px] h-[100px] mb-2">
                  <img
                    src={image.thumbnail}
                    alt={image.name}
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => handleDeleteClick(image, e)}
                    className="absolute top-1 right-1 p-1 bg-white bg-opacity-75 text-gray-600 
                      hover:text-red-500 rounded-full hover:bg-red-50"
                    title="Delete image"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-gray-900 truncate w-full text-center">
                  {image.name}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageList;