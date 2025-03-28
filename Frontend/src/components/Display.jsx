import React, { useState, useRef, useEffect } from 'react';
import envisionLogo from '../assest/envision.png'; // Import the logo

const Display = ({ isRecording, imagePath, onImageLoad, selectedTool, shapes, onShapesUpdate }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const displayRef = useRef(null);
  const canvasRef = useRef(null);
  const prevImagePathRef = useRef(imagePath);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentShape, setCurrentShape] = useState(null);

  // Drawing state
  const [points, setPoints] = useState([]);
  const [curvePoints, setCurvePoints] = useState([]);

  // Resolution state with default values
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });

  // Add state for measurements display
  const [measurements, setMeasurements] = useState([]);

  // Add canvas context ref
  const ctxRef = useRef(null);

  // Add calibration state
  const [calibrationFactor, setCalibrationFactor] = useState(null); // microns/pixel

  // Add zoom state
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

  // Add this near the top of the component with other state declarations
  const [calibrationScale, setCalibrationScale] = useState(''); // Store the scale text

  // Add these new states at the top of the component
  const [eraserRadius, setEraserRadius] = useState(15);

  // Add state for calibration
  const [currentCalibration, setCurrentCalibration] = useState(null);

  // Add default image state
  const [defaultImageLoaded, setDefaultImageLoaded] = useState(false);

  // Load calibration data when component mounts
  useEffect(() => {
    const loadCalibration = () => {
      const savedSettings = localStorage.getItem('cameraSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          // Get calibration data for the selected magnification
          fetch(`http://localhost:5000/api/get-calibration?magnification=${settings.magnification}`)
            .then(response => response.json())
            .then(data => {
              if (data.status === 'success') {
                setCalibrationFactor(data.calibrationFactor); // microns/pixel
                // Set the scale text
                setCalibrationScale(`1 pixel = ${data.calibrationFactor.toFixed(3)} microns`);
              }
            })
            .catch(error => {
              console.error('Error loading calibration:', error);
            });
        } catch (error) {
          console.error('Error loading calibration:', error);
        }
      }
    };

    loadCalibration();
    window.addEventListener('storage', loadCalibration);
    return () => window.removeEventListener('storage', loadCalibration);
  }, []);

  // Set up canvas context when component mounts or resolution changes
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctxRef.current = ctx;
      
      // Set canvas size
      canvas.width = resolution.width;
      canvas.height = resolution.height;
      
      // Set up initial context styles
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'top';
    }
  }, [resolution]);

  // Update drawing function to use context ref
  useEffect(() => {
    if (ctxRef.current) {
      drawShapes(ctxRef.current);
    }
  }, [shapes, currentShape]);

  // Load camera settings for resolution
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('cameraSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          const [width, height] = settings.resolution.split('x').map(Number);
          setResolution({ width, height });
          
          // Set canvas size to match resolution
          if (canvasRef.current) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
          }
        } catch (error) {
          console.error('Error loading camera settings:', error);
        }
      }
    };

    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  // Handle zoom with mouse wheel
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prevZoom => Math.min(Math.max(prevZoom * delta, 0.1), 5));
    }
  };

  // Update coordinate calculation for zoomed view
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    return {
      x: ((e.pageX - rect.left - scrollLeft) * scaleX) / zoom,
      y: ((e.pageY - rect.top - scrollTop) * scaleY) / zoom
    };
  };

  // Drawing functions for different tools
  const drawTools = {
    pointer: {
      mouseDown: () => {},
      mouseMove: () => {},
      mouseUp: () => {},
    },
    point: {
      mouseDown: (coords) => {
        const newPoint = { type: 'point', x: coords.x, y: coords.y };
        onShapesUpdate([...shapes, newPoint]);
      },
    },
    line: {
      mouseDown: (coords) => {
        setStartPoint(coords);
        setIsDrawing(true);
        setCurrentShape({ type: 'line', start: coords, end: coords });
      },
      mouseMove: (coords) => {
        if (isDrawing) {
          setCurrentShape({ type: 'line', start: startPoint, end: coords });
        }
      },
      mouseUp: (coords) => {
        if (isDrawing) {
          const newLine = { type: 'line', start: startPoint, end: coords };
          onShapesUpdate([...shapes, newLine]);
          setIsDrawing(false);
        }
      },
    },
    rectangle: {
      mouseDown: (coords) => {
        setStartPoint(coords);
        setIsDrawing(true);
        setCurrentShape({ type: 'rectangle', start: coords, end: coords });
      },
      mouseMove: (coords) => {
        if (isDrawing) {
          setCurrentShape({ type: 'rectangle', start: startPoint, end: coords });
        }
      },
      mouseUp: (coords) => {
        if (isDrawing) {
          const newRect = { type: 'rectangle', start: startPoint, end: coords };
          onShapesUpdate([...shapes, newRect]);
          setIsDrawing(false);
        }
      },
    },
    circle: {
      mouseDown: (coords) => {
        setStartPoint(coords);
        setIsDrawing(true);
        setCurrentShape({ type: 'circle', center: coords, radius: 0 });
      },
      mouseMove: (coords) => {
        if (isDrawing) {
          const radius = Math.sqrt(
            Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2)
          );
          setCurrentShape({ type: 'circle', center: startPoint, radius });
        }
      },
      mouseUp: (coords) => {
        if (isDrawing) {
          const radius = Math.sqrt(
            Math.pow(coords.x - startPoint.x, 2) + 
            Math.pow(coords.y - startPoint.y, 2)
          );
          const newCircle = { type: 'circle', center: startPoint, radius };
          onShapesUpdate([...shapes, newCircle]);
          setIsDrawing(false);
        }
      },
    },
    curve: {
      mouseDown: (coords) => {
        if (!isDrawing) {
          setCurvePoints([coords]);
          setIsDrawing(true);
        } else {
          setCurvePoints([...curvePoints, coords]);
        }
      },
      mouseMove: (coords) => {
        if (isDrawing) {
          setCurrentShape({
            type: 'curve',
            points: [...curvePoints, coords]
          });
        }
      },
      mouseUp: () => {},
      doubleClick: () => {
        if (isDrawing) {
          const newCurve = { type: 'curve', points: [...curvePoints] };
          onShapesUpdate([...shapes, newCurve]);
          setIsDrawing(false);
          setCurvePoints([]);
        }
      },
    },
    closedCurve: {
      mouseDown: (coords) => {
        if (!isDrawing) {
          setCurvePoints([coords]);
          setIsDrawing(true);
        } else {
          setCurvePoints([...curvePoints, coords]);
        }
      },
      mouseMove: (coords) => {
        if (isDrawing) {
          setCurrentShape({
            type: 'closedCurve',
            points: [...curvePoints, coords]
          });
        }
      },
      mouseUp: () => {},
      doubleClick: () => {
        if (isDrawing && curvePoints.length > 2) {
          const points = [...curvePoints, curvePoints[0]]; // Close the curve
          const newClosedCurve = { type: 'closedCurve', points };
          onShapesUpdate([...shapes, newClosedCurve]);
          setIsDrawing(false);
          setCurvePoints([]);
        }
      },
    },
    eraser: {
      mouseDown: (coords) => {
        setIsDrawing(true);
        eraseAtPoint(coords);
      },
      mouseMove: (coords) => {
        if (isDrawing) {
          requestAnimationFrame(() => {
          eraseAtPoint(coords);
          });
        }
      },
      mouseUp: () => {
        setIsDrawing(false);
        // Force final redraw
        if (ctxRef.current) {
          drawShapes(ctxRef.current);
        }
      }
    },
    arc: {
      mouseDown: (coords) => {
        setStartPoint(coords);
        setIsDrawing(true);
        setCurrentShape({ 
          type: 'arc', 
          center: coords, 
          radius: 0, 
          startAngle: 0, 
          endAngle: 0 
        });
      },
      mouseMove: (coords) => {
        if (isDrawing) {
          const radius = Math.sqrt(
            Math.pow(coords.x - startPoint.x, 2) + 
            Math.pow(coords.y - startPoint.y, 2)
          );
          
          // Calculate angle
          let pointAngle = Math.atan2(
            coords.y - startPoint.y,
            coords.x - startPoint.x
          );

          setCurrentShape({
            type: 'arc',
            center: startPoint,
            radius: radius,
            startAngle: 0,
            endAngle: pointAngle
          });
        }
      },
      mouseUp: (coords) => {
        if (isDrawing) {
          const radius = Math.sqrt(
            Math.pow(coords.x - startPoint.x, 2) + 
            Math.pow(coords.y - startPoint.y, 2)
          );
          
          let pointAngle = Math.atan2(
            coords.y - startPoint.y,
            coords.x - startPoint.x
          );

          const newArc = {
            type: 'arc',
            center: startPoint,
            radius: radius,
            startAngle: 0,
            endAngle: pointAngle
          };

          onShapesUpdate([...shapes, newArc]);
          setIsDrawing(false);
        }
      }
    },
  };

  // Update the eraser cursor effect
  useEffect(() => {
    if (selectedTool === 'eraser' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.style.cursor = 'none';
      
      const handleEraserCursor = (e) => {
        const coords = getCanvasCoordinates(e);
        
        // Clear and redraw everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw all shapes first
        shapes.forEach(shape => drawShape(ctx, shape));
        
        // Draw current shape if any
        if (currentShape) {
          drawShape(ctx, currentShape);
        }
        
        // Draw eraser cursor
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, eraserRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      
      canvas.addEventListener('mousemove', handleEraserCursor);
      
      return () => {
        canvas.style.cursor = 'default';
        canvas.removeEventListener('mousemove', handleEraserCursor);
      };
    }
  }, [selectedTool, eraserRadius, shapes, currentShape]);

  // Update the drawShapes function
  const drawShapes = (ctx) => {
    if (!ctx) return;
    
    // Clear the entire canvas first
    ctx.clearRect(0, 0, resolution.width, resolution.height);
    
    // Draw all saved shapes
    shapes.forEach(shape => drawShape(ctx, shape));
    
    // Draw current shape being drawn
    if (currentShape) {
      drawShape(ctx, currentShape);
    }

    // Ensure all drawing operations are completed
    ctx.save();
    ctx.restore();
  };

  // Update the eraseAtPoint function with better shape detection
  const eraseAtPoint = (coords) => {
    if (!coords) return;

    const newShapes = shapes.filter(shape => {
      switch (shape.type) {
        case 'point': {
          const distance = Math.sqrt(
            Math.pow(coords.x - shape.x, 2) + 
            Math.pow(coords.y - shape.y, 2)
          );
          return distance > eraserRadius;
        }

        case 'line': {
          // Improved line detection
          const A = { x: shape.start.x, y: shape.start.y };
          const B = { x: shape.end.x, y: shape.end.y };
          const P = coords;
          
          const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
          const AP = Math.sqrt(Math.pow(P.x - A.x, 2) + Math.pow(P.y - A.y, 2));
          const BP = Math.sqrt(Math.pow(P.x - B.x, 2) + Math.pow(P.y - B.y, 2));
          
          // If point is beyond line segment, check distance to endpoints
          if (AP <= eraserRadius || BP <= eraserRadius) return false;
          
          // Check distance to line segment
          const s = (AB + AP + BP) / 2;
          const area = Math.sqrt(s * (s - AB) * (s - AP) * (s - BP));
          const distance = (2 * area) / AB;
          return distance > eraserRadius;
        }

        case 'rectangle': {
          const x1 = Math.min(shape.start.x, shape.end.x);
          const x2 = Math.max(shape.start.x, shape.end.x);
          const y1 = Math.min(shape.start.y, shape.end.y);
          const y2 = Math.max(shape.start.y, shape.end.y);

          // Check if point is near any of the four edges
          const edges = [
            { start: { x: x1, y: y1 }, end: { x: x2, y: y1 } }, // top
            { start: { x: x2, y: y1 }, end: { x: x2, y: y2 } }, // right
            { start: { x: x2, y: y2 }, end: { x: x1, y: y2 } }, // bottom
            { start: { x: x1, y: y2 }, end: { x: x1, y: y1 } }  // left
          ];

          return !edges.some(edge => 
            isPointNearLineSegment(coords, edge.start, edge.end, eraserRadius)
          );
        }

        case 'circle': {
          const center = shape.center;
          const distanceToCenter = Math.sqrt(
            Math.pow(coords.x - center.x, 2) + 
            Math.pow(coords.y - center.y, 2)
          );
          // Check if point is near the circumference
          return Math.abs(distanceToCenter - shape.radius) > eraserRadius;
        }

        case 'curve':
        case 'closedCurve': {
          const points = shape.points;
          // Check each segment of the curve
          for (let i = 0; i < points.length - 1; i++) {
            const A = points[i];
            const B = points[i + 1];
            const P = coords;
            
            const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
            const AP = Math.sqrt(Math.pow(P.x - A.x, 2) + Math.pow(P.y - A.y, 2));
            const BP = Math.sqrt(Math.pow(P.x - B.x, 2) + Math.pow(P.y - B.y, 2));
            
            // If point is near endpoints
            if (AP <= eraserRadius || BP <= eraserRadius) return false;
            
            // Check distance to line segment
            const s = (AB + AP + BP) / 2;
            const area = Math.sqrt(s * (s - AB) * (s - AP) * (s - BP));
            const distance = (2 * area) / AB;
            
            if (distance <= eraserRadius) return false;
          }
          return true;
      }

        case 'arc': {
          // Check if point is near the arc line
          const center = shape.center;
          const distanceToCenter = Math.sqrt(
            Math.pow(coords.x - center.x, 2) + 
            Math.pow(coords.y - center.y, 2)
          );
          
          if (Math.abs(distanceToCenter - shape.radius) <= eraserRadius) {
            // Calculate angle of point relative to center
            let pointAngle = Math.atan2(
              coords.y - center.y,
              coords.x - center.x
            );
            
            // Check if point angle is within arc angles
            let startAngle = shape.startAngle;
            let endAngle = shape.endAngle;
            
            // Normalize angles
            while (startAngle < 0) startAngle += Math.PI * 2;
            while (endAngle < 0) endAngle += Math.PI * 2;
            while (pointAngle < 0) pointAngle += Math.PI * 2;
            
            if (endAngle < startAngle) endAngle += Math.PI * 2;
            
            return !(pointAngle >= startAngle && pointAngle <= endAngle);
          }
          return true;
        }

        default:
          return true;
      }
    });

    if (newShapes.length !== shapes.length) {
      onShapesUpdate(newShapes);
      requestAnimationFrame(() => {
        if (ctxRef.current) {
          drawShapes(ctxRef.current);
        }
      });
    }
  };

  // Add useEffect to handle canvas clearing when tool changes
  useEffect(() => {
    if (canvasRef.current && ctxRef.current) {
      drawShapes(ctxRef.current);
    }
  }, [selectedTool]);

  // Load calibration when component mounts
  useEffect(() => {
    const loadCalibration = () => {
      const savedCalibration = localStorage.getItem('currentCalibration');
      if (savedCalibration) {
        const calibData = JSON.parse(savedCalibration);
        setCurrentCalibration(calibData);
        console.log('Loaded calibration:', calibData); // For debugging
      }
    };

    loadCalibration();
    // Listen for calibration changes
    window.addEventListener('storage', loadCalibration);
    return () => window.removeEventListener('storage', loadCalibration);
  }, []);

  // Helper function to convert pixels to microns
  const pixelsToMicrons = (pixels) => {
    if (!currentCalibration?.calibrationFactor) return pixels;
    // Divide pixels by pixels/micron to get microns
    return pixels / currentCalibration.calibrationFactor;
  };

  // Update mouse event handlers
  const handleMouseDown = (e) => {
    if (!selectedTool || !ctxRef.current) return;
    
    const coords = getCanvasCoordinates(e);
    const tool = drawTools[selectedTool];
    if (tool?.mouseDown) {
      tool.mouseDown(coords);
    }
  };

  const handleMouseMove = (e) => {
    if (!selectedTool || !ctxRef.current || !isDrawing) return;
    
    const coords = getCanvasCoordinates(e);
    const tool = drawTools[selectedTool];
    if (tool?.mouseMove) {
      tool.mouseMove(coords);
      // Redraw shapes when moving
      drawShapes(ctxRef.current);
    }
  };

  const handleMouseUp = (e) => {
    if (!selectedTool || !ctxRef.current) return;
    
    const coords = getCanvasCoordinates(e);
    const tool = drawTools[selectedTool];
    if (tool?.mouseUp) {
      tool.mouseUp(coords);
      // Redraw shapes after finishing
      drawShapes(ctxRef.current);
    }
  };

  const handleDoubleClick = (e) => {
    const tool = drawTools[selectedTool];
    if (tool?.doubleClick) {
      tool.doubleClick();
    }
  };

  // Drawing function
  const drawShape = (ctx, shape) => {
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'top';

    switch (shape.type) {
      case 'point':
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Add label
        ctx.fillStyle = 'black';
        ctx.fillRect(shape.x + 10, shape.y - 20, 60, 20);
        ctx.fillStyle = 'white';
        ctx.fillText('Point', shape.x + 15, shape.y - 15);
        break;

      case 'line': {
        // Draw main line
        ctx.strokeStyle = '#00ff00'; // Bright green
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shape.start.x, shape.start.y);
        ctx.lineTo(shape.end.x, shape.end.y);
        ctx.stroke();
        
        // Draw perpendicular lines at endpoints
        const perpLength = 10; // Length of perpendicular lines
        const angle = Math.atan2(shape.end.y - shape.start.y, shape.end.x - shape.start.x);
        const perpAngle = angle + Math.PI/2;

        // Start point perpendicular line
        ctx.beginPath();
        ctx.moveTo(
          shape.start.x + Math.cos(perpAngle) * perpLength,
          shape.start.y + Math.sin(perpAngle) * perpLength
        );
        ctx.lineTo(
          shape.start.x - Math.cos(perpAngle) * perpLength,
          shape.start.y - Math.sin(perpAngle) * perpLength
        );
        ctx.stroke();

        // End point perpendicular line
        ctx.beginPath();
        ctx.moveTo(
          shape.end.x + Math.cos(perpAngle) * perpLength,
          shape.end.y + Math.sin(perpAngle) * perpLength
        );
        ctx.lineTo(
          shape.end.x - Math.cos(perpAngle) * perpLength,
          shape.end.y - Math.sin(perpAngle) * perpLength
        );
        ctx.stroke();

        // Calculate and display measurement
        const pixelDistance = Math.sqrt(
          Math.pow(shape.end.x - shape.start.x, 2) + 
          Math.pow(shape.end.y - shape.start.y, 2)
        );
        
        const micronsDistance = pixelsToMicrons(pixelDistance);

        // Display measurement with better visibility
        const midX = (shape.start.x + shape.end.x) / 2;
        const midY = (shape.start.y + shape.end.y) / 2;
        
        // Set up text first to measure it
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const text = `${Math.round(micronsDistance)} µm`;
        const textMetrics = ctx.measureText(text);
        const padding = 8;
        
        // Draw background with proper centering
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(
          midX - (textMetrics.width / 2) - padding,
          midY - 10 - padding,
          textMetrics.width + (padding * 2),
          20 + (padding * 2)
        );
        
        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, midX, midY);
        break;
      }

      case 'rectangle': {
        const width = Math.abs(shape.end.x - shape.start.x);
        const height = Math.abs(shape.end.y - shape.start.y);
        
        // Draw rectangle
        ctx.beginPath();
        ctx.rect(shape.start.x, shape.start.y, width, height);
        ctx.fill();
        ctx.stroke();
        
        // Calculate measurements in microns
        const widthMicrons = Math.round(pixelsToMicrons(width));
        const heightMicrons = Math.round(pixelsToMicrons(height));
        const areaMicrons = Math.round(widthMicrons * heightMicrons);

        // Display measurements with better visibility
        const centerX = shape.start.x + width/2;
        const centerY = shape.start.y + height/2;
        
        // Set up text measurements
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const text1 = `${widthMicrons} × ${heightMicrons} µm`;
        const text2 = `Area: ${areaMicrons} µm²`;
        const metrics1 = ctx.measureText(text1);
        const metrics2 = ctx.measureText(text2);
        const padding = 8;
        const maxWidth = Math.max(metrics1.width, metrics2.width);

        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(
          centerX - (maxWidth / 2) - padding,
          centerY - 20 - padding,
          maxWidth + (padding * 2),
          40 + (padding * 2)
        );

        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text1, centerX, centerY - 10);
        ctx.fillText(text2, centerX, centerY + 10);
        break;
      }

      case 'circle': {
        // Draw circle
        ctx.beginPath();
        ctx.arc(shape.center.x, shape.center.y, shape.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Calculate measurements in microns
        const radiusMicrons = Math.round(pixelsToMicrons(shape.radius));
        const areaMicrons = Math.round(Math.PI * radiusMicrons * radiusMicrons);
        
        // Display measurements with better visibility
        const center = shape.center;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(center.x - 60, center.y - 30, 120, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          `R: ${radiusMicrons} µm`,
          center.x,
          center.y - 15
        );
        ctx.fillText(
          `Area: ${areaMicrons} µm²`,
          center.x,
          center.y + 5
        );
        break;
      }

      case 'curve':
      case 'closedCurve':
        if (shape.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.slice(1).forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          if (shape.type === 'closedCurve') {
            ctx.closePath();
            ctx.fill();
          }
          ctx.stroke();

          // Add length or area measurement
          const lastPoint = shape.points[shape.points.length - 1];
          ctx.fillStyle = 'black';
          ctx.fillRect(lastPoint.x + 10, lastPoint.y - 25, 100, 20);
          ctx.fillStyle = 'white';
          if (shape.type === 'closedCurve') {
            // Calculate area using shoelace formula
            let area = 0;
            for (let i = 0; i < shape.points.length - 1; i++) {
              area += shape.points[i].x * shape.points[i + 1].y - 
                      shape.points[i + 1].x * shape.points[i].y;
            }
            area = Math.abs(area) / 2;
            ctx.fillText(`Area: ${area.toFixed(1)}`, lastPoint.x + 15, lastPoint.y - 20);
          } else {
            // Calculate curve length
            let length = 0;
            for (let i = 1; i < shape.points.length; i++) {
              length += Math.sqrt(
                Math.pow(shape.points[i].x - shape.points[i-1].x, 2) +
                Math.pow(shape.points[i].y - shape.points[i-1].y, 2)
              );
            }
            ctx.fillText(`Length: ${length.toFixed(1)}`, lastPoint.x + 15, lastPoint.y - 20);
          }
        }
        break;

      case 'arc': {
        ctx.beginPath();
        ctx.arc(
          shape.center.x,
          shape.center.y,
          shape.radius,
          shape.startAngle,
          shape.endAngle
        );
        ctx.stroke();

        // Draw radius line
        ctx.beginPath();
        ctx.moveTo(shape.center.x, shape.center.y);
        ctx.lineTo(
          shape.center.x + shape.radius * Math.cos(shape.endAngle),
          shape.center.y + shape.radius * Math.sin(shape.endAngle)
        );
        ctx.stroke();

        // Calculate and display measurements
        const arcLength = Math.abs(shape.endAngle - shape.startAngle) * shape.radius;
        const angle = Math.abs((shape.endAngle - shape.startAngle) * (180 / Math.PI));
        
        const arcLengthMicrons = pixelsToMicrons(arcLength);
        const radiusMicrons = pixelsToMicrons(shape.radius);

        // Display measurements
        const textX = shape.center.x + (shape.radius * 0.7) * Math.cos(shape.endAngle / 2);
        const textY = shape.center.y + (shape.radius * 0.7) * Math.sin(shape.endAngle / 2);

        ctx.fillStyle = 'black';
        ctx.fillRect(textX - 60, textY - 35, 120, 50);
        ctx.fillStyle = 'white';
        ctx.fillText(`R: ${radiusMicrons.toFixed(1)}µm`, textX - 55, textY - 30);
        ctx.fillText(`L: ${arcLengthMicrons.toFixed(1)}µm`, textX - 55, textY - 15);
        ctx.fillText(`A: ${angle.toFixed(1)}°`, textX - 55, textY);
        break;
      }
    }
  };

  useEffect(() => {
    if (isRecording) {
      setVideoUrl(`http://localhost:5000/api/video-feed?t=${new Date().getTime()}`);
      setImageUrl(null);
    } else {
      setVideoUrl(null);
    }
  }, [isRecording]);

  // Add effect to watch for camera settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      const savedSettings = localStorage.getItem('cameraSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          const [width, height] = settings.resolution.split('x').map(Number);
          
          // Update both resolution and dimensions
          setResolution({ width, height });
          setDimensions({ width, height });
          
          // Recalculate scale for new dimensions
          if (displayRef.current) {
            const newScale = calculateOptimalScale(width, height);
            setScale(newScale);
          }

          // If canvas exists, update its dimensions
          if (canvasRef.current) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
          }
        } catch (error) {
          console.error('Error loading camera settings:', error);
        }
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleSettingsChange);
    
    // Initial load
    handleSettingsChange();

    return () => {
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, []);

  // Modify the calculateOptimalScale function to not scale down large resolutions
  const calculateOptimalScale = (width, height) => {
    if (!displayRef.current) return 1;
    
    // Always return 1 to maintain original size
    return 1;
  };

  // Update image loading to use resolution
  useEffect(() => {
    if (imagePath && imagePath !== prevImagePathRef.current) {
      prevImagePathRef.current = imagePath;
      
      const formattedPath = imagePath.replace(/\\/g, '/');
      fetch(`http://localhost:5000/api/get-image?path=${encodeURIComponent(formattedPath)}`)
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch image');
          return response.blob();
        })
        .then(blob => {
          if (imageUrl) URL.revokeObjectURL(imageUrl);
          const newUrl = URL.createObjectURL(blob);
          
          const newScale = calculateOptimalScale(resolution.width, resolution.height);
          setScale(newScale);
          
          setImageUrl(newUrl);
          if (onImageLoad) onImageLoad(newUrl);
        })
        .catch(error => {
          console.error('Error loading image:', error);
          setImageUrl(null);
        });
    }
  }, [imagePath, resolution]);

  // Add helper text overlay
  const renderHelperText = () => {
    if (!selectedTool) return null;

    const helpText = {
      pointer: 'Click to select objects',
      line: 'Click and drag to measure distance',
      rectangle: 'Click and drag to measure area',
      circle: 'Click and drag to measure radius and area',
      point: 'Click to place a point marker',
      curve: 'Click points to draw curve, double-click to finish',
      closedCurve: 'Click points to draw shape, double-click to close',
      eraser: 'Click and drag to erase measurements',
    };

    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm">
        {helpText[selectedTool]}
      </div>
    );
  };

  // Add these helper functions for eraser
  const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const isPointNearCircle = (point, circle, threshold) => {
    const distance = getDistance(point, circle.center);
    return Math.abs(distance - circle.radius) <= threshold;
  };

  const isPointNearCurve = (point, points, threshold) => {
    for (let i = 0; i < points.length - 1; i++) {
      if (isPointNearLineSegment(point, points[i], points[i + 1], threshold)) {
        return true;
      }
    }
    return false;
  };

  // Add helper function to get points on a line (for smooth erasing)
  const getPointsOnLine = (start, end) => {
    const points = [];
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    
    // Get points every few pixels for smooth erasing
    const steps = Math.ceil(distance / 5); // 5 pixels between points
    for (let i = 0; i <= steps; i++) {
      points.push({
        x: start.x + (end.x - start.x) * (i / steps),
        y: start.y + (end.y - start.y) * (i / steps)
      });
    }
    return points;
  };

  // Improved helper function for rectangle detection
  const isPointNearRectangle = (point, rect, threshold) => {
    const x1 = Math.min(rect.start.x, rect.end.x);
    const x2 = Math.max(rect.start.x, rect.end.x);
    const y1 = Math.min(rect.start.y, rect.end.y);
    const y2 = Math.max(rect.start.y, rect.end.y);

    // Check if point is inside the rectangle
    if (point.x >= x1 - threshold && point.x <= x2 + threshold &&
        point.y >= y1 - threshold && point.y <= y2 + threshold) {
      // If point is near the edge
      const nearHorizontalEdge = Math.abs(point.y - y1) <= threshold || Math.abs(point.y - y2) <= threshold;
      const nearVerticalEdge = Math.abs(point.x - x1) <= threshold || Math.abs(point.x - x2) <= threshold;
      return nearHorizontalEdge || nearVerticalEdge;
    }
    return false;
  };

  // Add this helper function for line segment detection
  const isPointNearLineSegment = (point, start, end, threshold) => {
    const A = point.x - start.x;
    const B = point.y - start.y;
    const C = end.x - start.x;
    const D = end.y - start.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = start.x;
      yy = start.y;
    } else if (param > 1) {
      xx = end.x;
      yy = end.y;
    } else {
      xx = start.x + param * C;
      yy = start.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= threshold;
  };

  // Add effect to clear currentShape when shapes are cleared
  useEffect(() => {
    if (shapes.length === 0) {
      setCurrentShape(null);
      setIsDrawing(false);
      setCurvePoints([]);
      if (ctxRef.current) {
        drawShapes(ctxRef.current);
      }
    }
  }, [shapes]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-auto relative ml-[180px]"
      style={{
        height: 'calc(100vh - 88px)',
        paddingTop: '20px'
      }}
      onWheel={handleWheel}
    >
      {renderHelperText()}
      
      {/* Add calibration scale display */}
      {calibrationScale && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-1 rounded-full text-sm">
          {calibrationScale}
        </div>
      )}
      
      <div 
        className="relative"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: `${resolution.width}px`,
          height: `${resolution.height}px`,
          margin: '0 auto'
        }}
      >
        {/* Image Layer with Default Image */}
        {videoUrl ? (
          <img
            src={videoUrl}
            alt="Live Feed"
            className="absolute top-0 left-0"
            style={{
              width: `${resolution.width}px`,
              height: `${resolution.height}px`
            }}
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Captured Image"
            className="absolute top-0 left-0"
            style={{
              width: `${resolution.width}px`,
              height: `${resolution.height}px`
            }}
            onError={(e) => {
              console.error('Error displaying image');
              setImageUrl(null);
            }}
          />
        ) : (
          // Default Envision logo
          <img
            src={envisionLogo}
            alt="Envision Logo"
            className="absolute top-0 left-0"
            style={{
              width: `${resolution.width}px`,
              height: `${resolution.height}px`,
              objectFit: 'contain',
              opacity: 1 // Make it slightly transparent
            }}
          />
        )}

        {/* Drawing Canvas Layer */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: selectedTool === 'eraser' ? 'none' : 'crosshair',
            width: `${resolution.width}px`,
            height: `${resolution.height}px`,
            zIndex: 10
          }}
        />
      </div>
    </div>
  );
};

export default Display;