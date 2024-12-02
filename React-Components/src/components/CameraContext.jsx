import React, { createContext, useState } from "react";

export const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [importedImage, setImportedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null); // New state for captured image

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => setIsRecording(false);

  const captureImage = () => {
    console.log("Capture Image triggered from Context");
    // We will update the captured image in the context when the "Snap" button is clicked
    setCapturedImage(null); // Reset previous captured image
  };

  const importImage = (image) => {
    setImportedImage(image);
    console.log("Imported Image:", image);
  };

  return (
    <CameraContext.Provider
      value={{
        isRecording,
        startRecording,
        stopRecording,
        captureImage,
        importImage,
        capturedImage,  // Provide captured image to context
        setCapturedImage, // Provide method to set captured image
        importedImage,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};
