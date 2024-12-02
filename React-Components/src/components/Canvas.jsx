import React, { useContext, useEffect, useRef, useState } from "react";
import { CameraContext } from "./CameraContext";

const Canvas = () => {
  const { isRecording, captureImage, importedImage } = useContext(CameraContext);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null); // To store the camera stream for stopping later
  const [capturedImage, setCapturedImage] = useState(null);

  // Handle starting and stopping the camera stream
  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    if (isRecording) {
      getCameraStream();
    } else if (streamRef.current) {
      // Stop the camera when recording stops
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [isRecording]);

  // Handle capturing the image from the camera
  const captureSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Draw the current frame from the video to the canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Convert canvas to image URL and set it
    const imageUrl = canvas.toDataURL("image/png");
    setCapturedImage(imageUrl);
  };

  // Handle displaying the imported image
  useEffect(() => {
    if (importedImage && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.src = importedImage;

      img.onload = () => {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [importedImage]);

  return (
    <div className="container mx-auto p-8 flex flex-col items-center gap-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Capture Image from Camera
      </h1>
      <div className="flex flex-col items-center gap-4 w-full max-w-lg bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <div className="relative w-full">
          {/* Video stream or captured image */}
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full border rounded-lg" />
          ) : (
            <video
              ref={videoRef}
              id="video"
              autoPlay
              className={`w-full h-auto border rounded-lg ${isRecording ? '' : 'hidden'}`}
            />
          )}

          <canvas id="canvas" ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default Canvas;
