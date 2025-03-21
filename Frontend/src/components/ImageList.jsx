import React, { useState, useEffect } from 'react';
import { FaImage, FaTrash } from 'react-icons/fa';

const ImageList = ({ currentPath, onSelectImage, onDeleteImage }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (currentPath) {
      console.log('Loading images from:', currentPath);
      loadImages();
    }
  }, [currentPath]);

  const loadImages = async () => {
    try {
      setLoading(true);
      // Encode the path to handle special characters
      const encodedPath = encodeURIComponent(currentPath);
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
        setImages(data.images.map(img => ({
          ...img,
          path: img.path,
          name: img.name,
          date: new Date(img.date),
          size: img.size
        })));
      } else {
        console.error('Invalid response format:', data);
        setImages([]);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

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
          loadImages(); // Refresh the list
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
      
      <div className="overflow-y-auto p-2 space-y-2" style={{ height: 'calc(280px - 48px)' }}>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No images found in this folder
          </div>
        ) : (
          images.map((image) => (
            <div
              key={image.path}
              onClick={() => handleImageClick(image)}
              className={`flex items-center p-2 rounded-lg cursor-pointer transition-all
                ${selectedImage === image.path ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                border border-gray-200`}
            >
              <div className="flex-shrink-0">
                <FaImage className="w-8 h-8 text-gray-400" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {image.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(image.date)} • {formatFileSize(image.size)}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteClick(image, e)}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                title="Delete image"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ImageList;