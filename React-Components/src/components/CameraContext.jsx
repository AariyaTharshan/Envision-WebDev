import React, { createContext, useState } from "react";

export const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [importedImage, setImportedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null); // Captured image state

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => setIsRecording(false);

  const captureImage = () => {
    console.log("Capture Image triggered from Context");
    // Capture image logic will be triggered from Canvas component
    setCapturedImage(null); // Reset previous captured image to ensure it's fresh
  };

  const importImage = (image) => {
    console.log("Imported Image in Context:", image);
    setImportedImage(image); // Set imported image in context
  };

  return (
    <CameraContext.Provider
      value={{
        isRecording,
        startRecording,
        stopRecording,
        captureImage,
        importImage,
        capturedImage, // Provide captured image
        setCapturedImage, // Expose method to directly set captured image
        importedImage, // Expose imported image
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};
