import cv2
import numpy as np
from flask import jsonify
import os

def analyze_porosity(image_path, unit='microns', features='dark'):
    """
    Analyze porosity in the image
    """
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return {
                'status': 'error',
                'message': 'Failed to read image'
            }

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply threshold based on feature type
        if features == 'dark':
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        else:
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Analyze each pore
        results = []
        for i, contour in enumerate(contours):
            # Calculate properties
            area = cv2.contourArea(contour)
            perimeter = cv2.arcLength(contour, True)
            x, y, w, h = cv2.boundingRect(contour)
            
            # Calculate circularity
            circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter > 0 else 0

            # Add to results
            results.append({
                'id': i + 1,
                'length': round(h, 2),
                'width': round(w, 2),
                'area': round(area, 2),
                'circ': round(circularity, 2),
                'per': round(perimeter, 2)
            })

        return {
            'status': 'success',
            'results': results
        }

    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }

def prepare_image(image_path, prep_option):
    """
    Prepare image for porosity analysis
    """
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return {
                'status': 'error',
                'message': 'Failed to read image'
            }

        # Apply selected preparation method
        if prep_option == 'threshold':
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            processed = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        elif prep_option == 'edge_detect':
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            processed = cv2.Canny(gray, 100, 200)
        else:
            return {
                'status': 'error',
                'message': 'Invalid preparation option'
            }

        # Save processed image
        directory = os.path.dirname(image_path)
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_{prep_option}{ext}"
        new_path = os.path.join(directory, new_filename)
        
        cv2.imwrite(new_path, processed)

        return {
            'status': 'success',
            'filepath': new_path
        }

    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }