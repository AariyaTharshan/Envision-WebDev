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

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'MvImport')))
from MvCameraControl_class import *

app = Flask(__name__)
CORS(app)

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
                    # Get HIKROBOT frame
                    stOutFrame = MV_FRAME_OUT()
                    ret = self.camera.MV_CC_GetImageBuffer(stOutFrame, 1000)
                    if ret == 0:
                        # Convert frame to OpenCV format
                        pData = (c_ubyte * stOutFrame.stFrameInfo.nFrameLen)()
                        cdll.msvcrt.memcpy(byref(pData), stOutFrame.pBufAddr, stOutFrame.stFrameInfo.nFrameLen)
                        data = np.frombuffer(pData, count=int(stOutFrame.stFrameInfo.nFrameLen), dtype=np.uint8)
                        frame = data.reshape((stOutFrame.stFrameInfo.nHeight, stOutFrame.stFrameInfo.nWidth, -1))
                        
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True) 