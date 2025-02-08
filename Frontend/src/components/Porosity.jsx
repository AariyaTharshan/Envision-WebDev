import React, { useState, useRef, useEffect } from 'react';

const Porosity = ({ imagePath }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [imagePrep, setImagePrep] = useState('');
    const [filters, setFilters] = useState('');
    const [distribution, setDistribution] = useState('');
    const [results, setResults] = useState([]);
    const [unit, setUnit] = useState('microns');
    const [features, setFeatures] = useState('dark');
    const [processedImagePath, setProcessedImagePath] = useState(imagePath);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (imagePath) {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                
                // Set canvas size to match image but maintain aspect ratio
                const maxWidth = 550; // Slightly less than sidebar width
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;
                
                // Draw image scaled
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = `http://localhost:5000/api/images/${encodeURIComponent(imagePath)}`;
        }
    }, [imagePath, processedImagePath]);

    const handleImagePrep = async (option) => {
        try {
            if (!imagePath) {
                alert('Please select an image first');
                return;
            }

            const response = await fetch('http://localhost:5000/api/porosity/prep', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imagePath: imagePath,
                    prepOption: option
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === 'success') {
                setImagePrep(data.filepath);
            } else {
                alert('Failed to prepare image: ' + data.message);
            }
        } catch (error) {
            console.error('Error in image preparation:', error);
            alert('Error in image preparation: ' + error.message);
        }
    };

    const handleAnalysis = async () => {
        try {
            if (!imagePath) {
                alert('Please select an image first');
                return;
            }

            const response = await fetch('http://localhost:5000/api/porosity/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imagePath: imagePath,
                    unit: unit,
                    features: features
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === 'success') {
                setResults(data.results);
            } else {
                alert('Failed to analyze porosity: ' + data.message);
            }
        } catch (error) {
            console.error('Error in porosity analysis:', error);
            alert('Error in porosity analysis: ' + error.message);
        }
    };

    return (
        <div className="h-full py-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Porosity Analysis</h2>
            
            {/* Image Display Section */}
            <div className="px-4 mb-4">
                <div className="border rounded-lg overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-auto"
                    />
                </div>
            </div>

            {/* Controls Section */}
            <div className="px-4 space-y-4">
                {/* Unit Selection */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Measurement Unit
                    </label>
                    <select 
                        className="w-full border rounded p-2"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                    >
                        <option value="microns">microns</option>
                        <option value="mm">mm</option>
                    </select>
                </div>

                {/* Image Preparation */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Preparation
                    </label>
                    <select 
                        className="w-full border rounded p-2"
                        value={imagePrep}
                        onChange={(e) => handleImagePrep(e.target.value)}
                    >
                        <option value="">Select</option>
                        <option value="threshold">Threshold</option>
                        <option value="edge_detect">Edge Detection</option>
                    </select>
                </div>

                {/* Filters */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filters
                    </label>
                    <select 
                        className="w-full border rounded p-2"
                        value={filters}
                        onChange={(e) => setFilters(e.target.value)}
                    >
                        <option value="">Select</option>
                        <option value="lowpass">Low Pass</option>
                        <option value="median">Median</option>
                    </select>
                </div>

                {/* Features Selection */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Features
                    </label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="dark"
                                checked={features === 'dark'}
                                onChange={(e) => setFeatures(e.target.value)}
                                className="mr-2"
                            />
                            Dark
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="light"
                                checked={features === 'light'}
                                onChange={(e) => setFeatures(e.target.value)}
                                className="mr-2"
                            />
                            Light
                        </label>
                    </div>
                </div>

                {/* Results Table */}
                {results.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Results</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border">
                                <thead>
                                    <tr>
                                        <th className="border p-2">Id</th>
                                        <th className="border p-2">Length</th>
                                        <th className="border p-2">Width</th>
                                        <th className="border p-2">Area</th>
                                        <th className="border p-2">Circ</th>
                                        <th className="border p-2">Per</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result, index) => (
                                        <tr key={index}>
                                            <td className="border p-2">{result.id}</td>
                                            <td className="border p-2">{result.length}</td>
                                            <td className="border p-2">{result.width}</td>
                                            <td className="border p-2">{result.area}</td>
                                            <td className="border p-2">{result.circ}</td>
                                            <td className="border p-2">{result.per}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                    <button
                        onClick={handleAnalysis}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Run Analysis
                    </button>
                    <button
                        onClick={() => {/* Add save functionality */}}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Save Results
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Porosity;