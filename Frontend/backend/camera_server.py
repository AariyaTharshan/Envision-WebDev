from flask import Flask, Response, jsonify, request, send_file
from flask_cors import CORS
import cv2
import time
import threading
import os
import sys
from pathlib import Path
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image
import numpy as np
import json
from porosity_analysis import analyze_porosity, prepare_im

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'MvImport')))
from MvCameraControl_class import *

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5173"], "methods": ["GET", "POST", "OPTIONS"], "headers": ["Content-Type"]}})

class WebcamManager:
    def __init__(self):
        self.camera = None
        self.is_recording = False
        self.frame = None
        self.thread = None
        self.last_frame = None
        self.default_save_path = 'C:\\Users\\Public\\MicroScope_Images'
        self.current_camera_type = None
        self.hikrobot_camera = None  # For HIKROBOT camera instance
        self.current_resolution = None

    def start_camera(self, camera_type=None):
        try:
            if self.camera is not None:
                self.stop_camera()

            print(f"Starting camera with type: {camera_type}")

            if camera_type == "HIKERBOT":
                # Initialize HIKROBOT camera
                self.hikrobot_camera = MvCamera()
                
                # Initialize SDK
                ret = self.hikrobot_camera.MV_CC_Initialize()
                if ret != 0:
                    print("Initialize SDK fail!")
                    return False

                # Enumerate devices
                deviceList = MV_CC_DEVICE_INFO_LIST()
                ret = self.hikrobot_camera.MV_CC_EnumDevices(MV_GIGE_DEVICE | MV_USB_DEVICE, deviceList)
                if ret != 0:
                    print("Enum Devices fail!")
                    return False

                if deviceList.nDeviceNum == 0:
                    print("No HIKROBOT camera found!")
                    return False

                # Select first available device
                stDeviceList = cast(deviceList.pDeviceInfo[0], POINTER(MV_CC_DEVICE_INFO)).contents

                # Create handle
                ret = self.hikrobot_camera.MV_CC_CreateHandle(stDeviceList)
                if ret != 0:
                    print("Create Handle fail!")
                    return False

                # Open device
                ret = self.hikrobot_camera.MV_CC_OpenDevice(MV_ACCESS_Exclusive, 0)
                if ret != 0:
                    print("Open Device fail!")
                    return False

                # Start grabbing
                ret = self.hikrobot_camera.MV_CC_StartGrabbing()
                if ret != 0:
                    print("Start Grabbing fail!")
                    return False

                self.camera = self.hikrobot_camera
                self.current_camera_type = 'HIKERBOT'
            else:
                # Default webcam (index 0)
                print("Using default webcam")
                self.camera = cv2.VideoCapture(0)
                self.current_camera_type = 'WEBCAM'

            self.is_recording = True
            self.thread = threading.Thread(target=self.capture_frames)
            self.thread.daemon = True
            self.thread.start()
            
            return True
        except Exception as e:
            print(f"Error starting camera: {str(e)}")
            return False

    def capture_frames(self):
        while self.is_recording:
            try:
                if self.current_camera_type == 'HIKERBOT':
                    stOutFrame = MV_FRAME_OUT()
                    ret = self.camera.MV_CC_GetImageBuffer(stOutFrame, 1000)
                    if ret == 0:
                        # Use current resolution if set
                        if self.current_resolution:
                            width, height = self.current_resolution
                        else:
                            width = stOutFrame.stFrameInfo.nWidth
                            height = stOutFrame.stFrameInfo.nHeight

                        pData = (c_ubyte * stOutFrame.stFrameInfo.nFrameLen)()
                        cdll.msvcrt.memcpy(byref(pData), stOutFrame.pBufAddr, stOutFrame.stFrameInfo.nFrameLen)
                        data = np.frombuffer(pData, count=int(stOutFrame.stFrameInfo.nFrameLen), dtype=np.uint8)
                        frame = data.reshape((height, width, -1))
                        
                        # Release buffer
                        self.camera.MV_CC_FreeImageBuffer(stOutFrame)
                        
                        # Convert to JPEG
                        _, buffer = cv2.imencode('.jpg', frame)
                        self.frame = buffer.tobytes()
                        self.last_frame = self.frame
                else:
                    # Regular webcam capture
                    if self.camera is None or not self.camera.isOpened():
                        break

                    success, frame = self.camera.read()
                    if success:
                        frame = cv2.flip(frame, 1)
                        _, buffer = cv2.imencode('.jpg', frame)
                        self.frame = buffer.tobytes()
                        self.last_frame = self.frame

                time.sleep(0.033)
            except Exception as e:
                print(f"Error capturing frame: {str(e)}")
                break

        self.is_recording = False

    def stop_camera(self):
        self.is_recording = False
        if self.thread:
            self.thread.join(timeout=1.0)
        
        if self.current_camera_type == 'HIKERBOT':
            if self.camera:
                self.camera.MV_CC_StopGrabbing()
                self.camera.MV_CC_CloseDevice()
                self.camera.MV_CC_DestroyHandle()
        else:
            if self.camera:
                self.camera.release()
        
        self.camera = None
        self.frame = None
        self.current_camera_type = None

    def take_snapshot(self, save_path=None):
        if self.last_frame:
            try:
                # Use provided save path or default
                if not save_path:
                    save_path = self.default_save_path
                
                # Create directory if it doesn't exist
                os.makedirs(save_path, exist_ok=True)
                
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"microscope_{timestamp}.jpg"
                filepath = os.path.join(save_path, filename)
                
                with open(filepath, 'wb') as f:
                    f.write(self.last_frame)
                
                print(f"Snapshot saved to: {filepath}")
                return filepath
            except Exception as e:
                print(f"Error taking snapshot: {str(e)}")
                return None
        return None

    def set_resolution(self, width, height):
        if self.current_camera_type == 'HIKERBOT' and self.camera:
            try:
                # Stop grabbing before changing settings
                self.camera.MV_CC_StopGrabbing()
                
                # Set resolution
                ret = self.camera.MV_CC_SetIntValue("Width", width)
                if ret != 0:
                    print("Failed to set width")
                    return False

                ret = self.camera.MV_CC_SetIntValue("Height", height)
                if ret != 0:
                    print("Failed to set height")
                    return False

                # Resume grabbing
                ret = self.camera.MV_CC_StartGrabbing()
                if ret != 0:
                    print("Failed to restart grabbing")
                    return False

                self.current_resolution = (width, height)
                return True
            except Exception as e:
                print(f"Error setting resolution: {str(e)}")
                return False
        return False

webcam = WebcamManager()

@app.route('/api/start-camera', methods=['POST'])
def start_camera():
    try:
        data = request.get_json()
        camera_type = data.get('cameraType')
        print(f"Starting camera with type: {camera_type}")  # Debug log
        
        if webcam.start_camera(camera_type):
            return jsonify({'status': 'success'})
        return jsonify({'status': 'error', 'message': 'Failed to start camera'})
    except Exception as e:
        print(f"Error in start_camera route: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/stop-camera', methods=['POST'])
def stop_camera():
    webcam.stop_camera()
    return jsonify({'status': 'success'})

@app.route('/api/video-feed')
def video_feed():
    def generate():
        while True:
            if not webcam.is_recording:
                break
            if webcam.frame is not None:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + webcam.frame + b'\r\n')
            time.sleep(0.033)
    
    return Response(generate(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/snapshot', methods=['POST'])
def take_snapshot():
    try:
        data = request.get_json()
        save_path = data.get('savePath') if data else None
        
        filepath = webcam.take_snapshot(save_path)
        if filepath:
            return jsonify({
                'status': 'success',
                'filepath': filepath
            })
        return jsonify({
            'status': 'error',
            'message': 'Failed to take snapshot'
        })
    except Exception as e:
        print(f"Error in snapshot route: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

@app.route('/api/get-image')
def get_image():
    try:
        image_path = request.args.get('path')
        if not image_path:
            return jsonify({'error': 'No path provided'}), 400
        
        if not os.path.exists(image_path):
            return jsonify({'error': 'Image not found'}), 404

        return send_file(image_path, mimetype='image/jpeg')
    except Exception as e:
        print(f"Error serving image: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/import-image', methods=['POST'])
def import_image():
    try:
        print("Starting import process...")
        
        if 'file' not in request.files:
            print("No file part in request. Files received:", request.files)
            return jsonify({
                'status': 'error',
                'message': 'No file part'
            }), 400
            
        file = request.files['file']
        print(f"Received file: {file.filename}")
        
        if file.filename == '':
            print("No selected file")
            return jsonify({
                'status': 'error',
                'message': 'No selected file'
            }), 400

        if file:
            try:
                filename = secure_filename(file.filename)
                save_dir = webcam.default_save_path  # Use WebcamManager's default path
                print(f"Using save directory: {save_dir}")
                
                os.makedirs(save_dir, exist_ok=True)
                
                # Add timestamp to filename to avoid conflicts
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                base, ext = os.path.splitext(filename)
                filename = f"{base}_{timestamp}{ext}"
                
                filepath = os.path.join(save_dir, filename)
                print(f"Attempting to save file to: {filepath}")
                
                # Save the file
                file.save(filepath)
                print(f"File saved successfully")
                
                # Verify file exists and is readable
                if os.path.exists(filepath):
                    try:
                        # Try to open the file to verify it's valid
                        with open(filepath, 'rb') as test_file:
                            test_file.read(1024)  # Read first 1KB to verify file
                        
                        print(f"File verified at: {filepath}")
                        return jsonify({
                            'status': 'success',
                            'filepath': filepath
                        })
                    except Exception as read_error:
                        print(f"File exists but cannot be read: {str(read_error)}")
                        return jsonify({
                            'status': 'error',
                            'message': 'File saved but cannot be read'
                        }), 500
                else:
                    print(f"File not found after saving")
                    return jsonify({
                        'status': 'error',
                        'message': 'File not found after saving'
                    }), 500
                    
            except Exception as save_error:
                print(f"Error saving file: {str(save_error)}")
                return jsonify({
                    'status': 'error',
                    'message': f'Error saving file: {str(save_error)}'
                }), 500
            
    except Exception as e:
        print(f"Error in import process: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/rotate-image', methods=['POST'])
def rotate_image():
    try:
        print("Rotation endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        direction = data.get('direction', 'clockwise')
        
        print(f"Processing rotation: {direction} for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Simple 90-degree rotation without any scaling or interpolation
        if direction == 'clockwise':
            rotated_img = np.rot90(img, k=-1)  # -1 for clockwise
        else:
            rotated_img = np.rot90(img, k=1)   # 1 for counterclockwise

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_rotated{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving rotated image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, rotated_img, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Rotation completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during rotation: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/flip-image', methods=['POST'])
def flip_image():
    try:
        print("Flip endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        direction = data.get('direction', 'horizontal')
        
        print(f"Processing flip: {direction} for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Flip the image based on direction
        if direction == 'horizontal':
            flipped_img = cv2.flip(img, 1)  # 1 for horizontal flip
        else:
            flipped_img = cv2.flip(img, 0)  # 0 for vertical flip

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_flipped{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving flipped image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, flipped_img, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Flip completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during flip: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/set-camera-resolution', methods=['POST'])
def set_camera_resolution():
    try:
        data = request.get_json()
        resolution = data.get('resolution')  # This will be like "1920x1080"
        
        if not resolution or 'x' not in resolution:
            return jsonify({
                'status': 'error',
                'message': 'Invalid resolution format'
            }), 400

        width, height = map(int, resolution.split('x'))
        
        if webcam.set_resolution(width, height):
            return jsonify({'status': 'success'})
        else:
            return jsonify({
                'status': 'error',
                'message': 'Camera not initialized or not HIKERBOT'
            }), 400
    except Exception as e:
        print(f"Error setting camera resolution: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/lowpass-filter', methods=['POST'])
def apply_lowpass_filter():
    try:
        print("Low pass filter endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        
        print(f"Processing low pass filter for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Apply Gaussian blur (low pass filter)
        filtered_img = cv2.GaussianBlur(img, (25, 25), 0)

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_lowpass{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving filtered image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, filtered_img, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Low pass filter completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during low pass filter: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/median-filter', methods=['POST'])
def apply_median_filter():
    try:
        print("Median filter endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        
        print(f"Processing median filter for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Apply Median blur
        filtered_img = cv2.medianBlur(img, 15)  # kernel size 5x5

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_median{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving filtered image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, filtered_img, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Median filter completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during median filter: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/edge-detect', methods=['POST'])
def apply_edge_detect():
    try:
        print("Edge detection filter endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        
        print(f"Processing edge detection for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Convert to grayscale if image is color
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply Canny edge detection
        edges = cv2.Canny(blurred, 100, 200)  # Adjust thresholds as needed
        
        # Convert back to BGR for saving
        edges_bgr = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_edges{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving edge detected image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, edges_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Edge detection completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during edge detection: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/edge-emphasis', methods=['POST'])
def apply_edge_emphasis():
    try:
        print("Edge emphasis filter endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        
        print(f"Processing edge emphasis for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Convert to float32 for processing
        img_float = img.astype(np.float32) / 255.0

        # Create sharpening kernel
        kernel = np.array([[-1,-1,-1],
                         [-1, 9,-1],
                         [-1,-1,-1]], dtype=np.float32)

        # Apply edge emphasis filter
        emphasized = cv2.filter2D(img_float, -1, kernel)
        
        # Convert back to uint8
        emphasized = np.clip(emphasized * 255, 0, 255).astype(np.uint8)

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_emphasized{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving edge emphasized image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, emphasized, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Edge emphasis completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during edge emphasis: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/grayscale', methods=['POST'])
def apply_grayscale():
    try:
        print("Grayscale filter endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        
        print(f"Processing grayscale for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Convert back to BGR for saving
        gray_bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_gray{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving grayscale image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, gray_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Grayscale completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during grayscale: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/invert', methods=['POST'])
def apply_invert():
    try:
        print("Invert filter endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        
        print(f"Processing invert for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Invert the image
        inverted = cv2.bitwise_not(img)

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_inverted{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving inverted image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, inverted, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Invert completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during invert: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/thin', methods=['POST'])
def apply_thin():
    try:
        print("Thin filter endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        
        print(f"Processing thin for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Convert to grayscale if image is color
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img

        # Apply Otsu's thresholding
        _, thresholded = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Apply erosion and dilation for thinning
        kernel = np.ones((3, 3), np.uint8)
        eroded = cv2.erode(thresholded, kernel, iterations=1)
        dilated = cv2.dilate(eroded, kernel, iterations=1)

        # Convert back to BGR for saving
        thinned_bgr = cv2.cvtColor(dilated, cv2.COLOR_GRAY2BGR)

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_thinned{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving thinned image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, thinned_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Thin completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during thin: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/image-splice', methods=['POST'])
def apply_image_splice():
    try:
        print("Image splice endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_paths = data.get('imagePaths', [])  # Get array of image paths
        direction = data.get('direction', 'horizontal')
        
        print(f"Processing image splice for images: {image_paths}")
        
        if not image_paths or len(image_paths) < 2:
            return jsonify({
                'status': 'error',
                'message': 'Need at least 2 images to splice'
            }), 400

        # Read all images
        images = []
        for path in image_paths:
            if not os.path.exists(path):
                return jsonify({
                    'status': 'error',
                    'message': f'Image not found: {path}'
                }), 404

            img = cv2.imread(path)
            if img is None:
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to read image: {path}'
                }), 500
            images.append(img)

        # Get dimensions of first image
        h1, w1 = images[0].shape[:2]
        
        # Resize all images to match the first image's dimensions
        resized_images = [images[0]]
        for img in images[1:]:
            resized = cv2.resize(img, (w1, h1))
            resized_images.append(resized)
        
        # Create a panorama by concatenating images
        if direction == 'horizontal':
            result = np.hstack(resized_images)
        else:
            result = np.vstack(resized_images)

        # Save with new filename
        directory = os.path.dirname(image_paths[0])
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        new_filename = f"spliced_{timestamp}.jpg"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving spliced image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, result, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Image splice completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during image splice: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/image-sharpen', methods=['POST'])
def apply_image_sharpen():
    try:
        print("Image sharpen endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        
        print(f"Processing image sharpen for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Apply sharpening filter
        kernel = np.array([[-1,-1,-1],
                         [-1, 9,-1],
                         [-1,-1,-1]], dtype=np.float32)
        sharpened = cv2.filter2D(img, -1, kernel)

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_sharpened{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving sharpened image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, sharpened, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Image sharpen completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during image sharpen: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/image-stitch', methods=['POST'])
def apply_image_stitch():
    try:
        print("Image stitch endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_paths = data.get('imagePaths', [])
        
        print(f"Processing image stitch for images: {image_paths}")
        
        if not image_paths or len(image_paths) < 2:
            return jsonify({
                'status': 'error',
                'message': 'At least two images are required for stitching'
            }), 400

        # Read images with OpenCV
        images = []
        for img_path in image_paths:
            img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
            if img is None:
                return jsonify({
                    'status': 'error',
                    'message': f'Failed to read image: {img_path}'
                }), 500
            images.append(img)

        # Resize all images to match the first image's dimensions
        resized_images = []
        for img in images:
            resized_img = cv2.resize(img, (images[0].shape[1], images[0].shape[0]))
            resized_images.append(resized_img)

        # Create a panorama by blending overlapping regions
        stitched_img = resized_images[0]
        for i in range(1, len(resized_images)):
            stitched_img = cv2.addWeighted(stitched_img, 0.5, resized_images[i], 0.5, 0)

        # Save with new filename
        directory = os.path.dirname(image_paths[0])
        filename = os.path.basename(image_paths[0])
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_stitched{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving stitched image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, stitched_img, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Image stitch completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during image stitch: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/save-calibration', methods=['POST'])
def save_calibration():
    try:
        print("Save calibration endpoint called")
        data = request.get_json()
        print("Received calibration data:", data)
        
        calibration_data = data.get('calibrationData')
        if not calibration_data:
            return jsonify({
                'status': 'error',
                'message': 'No calibration data provided'
            }), 400

        # Create calibration directory if it doesn't exist
        calibration_dir = os.path.join('calibration_data')
        os.makedirs(calibration_dir, exist_ok=True)

        # Save calibration data with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"calibration_{timestamp}.json"
        filepath = os.path.join(calibration_dir, filename)

        with open(filepath, 'w') as f:
            json.dump(calibration_data, f, indent=4)
        
        print(f"Calibration data saved to: {filepath}")
        return jsonify({
            'status': 'success',
            'message': 'Calibration data saved successfully',
            'filepath': filepath
        })
        
    except Exception as e:
        print(f"Error saving calibration data: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/threshold', methods=['POST'])
def apply_threshold():
    try:
        print("Threshold filter endpoint called")
        data = request.get_json()
        print("Received data:", data)
        
        image_path = data.get('imagePath')
        
        print(f"Processing threshold for image: {image_path}")
        
        if not image_path or not os.path.exists(image_path):
            print(f"Image not found at path: {image_path}")
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        # Read image with OpenCV
        img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            return jsonify({
                'status': 'error',
                'message': 'Failed to read image'
            }), 500

        # Convert to grayscale if image is color
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply Otsu's thresholding
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Convert back to BGR for saving
        thresh_bgr = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)

        # Save with new filename
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_threshold{ext}"
        new_path = os.path.join(directory, new_filename)
        
        print(f"Saving thresholded image to: {new_path}")
        # Save with original quality
        cv2.imwrite(new_path, thresh_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 100])
        
        print("Thresholding completed successfully")
        return jsonify({
            'status': 'success',
            'filepath': new_path
        })
        
    except Exception as e:
        print(f"Error during thresholding: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/porosity/analyze', methods=['POST'])
def porosity_analysis():
    try:
        data = request.get_json()
        image_path = data.get('imagePath')
        unit = data.get('unit', 'microns')
        features = data.get('features', 'dark')
        
        if not image_path or not os.path.exists(image_path):
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        result = analyze_porosity(image_path, unit, features)
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/porosity/prep', methods=['POST'])
def porosity_prep():
    try:
        data = request.get_json()
        image_path = data.get('imagePath')
        prep_option = data.get('prepOption')
        
        if not image_path or not os.path.exists(image_path):
            return jsonify({
                'status': 'error',
                'message': 'Image not found'
            }), 404

        result = prepare_image(image_path, prep_option)
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True) 