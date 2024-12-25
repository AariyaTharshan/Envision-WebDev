import React, { useState, useEffect } from "react";

const FlakeConfiguration = () => {
  const configData = [
    {
      key: "rosetteFlakeRadiusFactor",
      label: "Rosette Flake Radius Factor",
      defaultValue: 0.3,
      note: "This value determines the maximum diameter of the rosette flake. The max diameter will be image diagonal length * factor."
    },
    {
      key: "rosetteDensityFactor",
      label: "Rosette Density Factor",
      defaultValue: 0.8,
      note: "The ratio that determines the cut-off for highest flake density."
    },
    {
      key: "minRosetteFlakeCount",
      label: "Min Rosette Flake Count",
      defaultValue: 15,
      note: "This value determines the minimum number of flakes needed for rosette flakes."
    },
    {
      key: "minRosetteStarFlakeCount",
      label: "Min Rosette Star Flake Count",
      defaultValue: 5,
      note: "This value determines the minimum number of flakes for star-like rosettes with multiple edges."
    },
    {
      key: "minAreaPercentForStar",
      label: "Min Area % for Star",
      defaultValue: 5,
      note: "This value determines the minimum area % for a flake to qualify as a star flake."
    },
    {
      key: "typeDFlakeRatio",
      label: "Type D Flake Ratio",
      defaultValue: 0.8,
      note: "This value determines the ratio for qualifying Type-D flakes."
    },
    {
      key: "flakeAngleWindowSize",
      label: "Flake Angle Window Size",
      defaultValue: 15,
      note: "This value determines the maximum size of flake angle windows for alignment."
    },
    {
      key: "flakeUniformAlignRatio",
      label: "Flake Uniform Align Ratio",
      defaultValue: 0.66,
      note: "The cut-off value for qualifying flakes as uniformly aligned instead of randomly aligned."
    },
    {
      key: "maxFlakeAngleToRosetteCenter",
      label: "Max Flake Angle to Rosette Center",
      defaultValue: 15,
      note: "The maximum angle between flake end points and rosette center to consider a part of the rosette."
    },
    {
      key: "rosetteFlakeRatio",
      label: "Rosette Flake Ratio",
      defaultValue: 0.5,
      note: "The ratio that determines the minimum number of flakes that fall within Max flake angle."
    },
    {
      key: "flakeRosetteInclusionRatio",
      label: "Flake Rosette Inclusion Ratio",
      defaultValue: 0.75,
      note: "This ratio determines if a flake should be included as part of a rosette."
    },
    {
      key: "flakeCompactness",
      label: "Flake Compactness",
      defaultValue: 0.5,
      note: "Defines how compact the flake cluster is."
    },
    {
      key: "flakeClusterPercentage",
      label: "Flake Cluster Percentage",
      defaultValue: 75,
      note: "Minimum percentage of flakes to consider as part of the cluster."
    }
  ];

  const [formData, setFormData] = useState({});

  // Load from local storage on mount
  useEffect(() => {
    const storedData = {};
    configData.forEach((field) => {
      const storedValue = localStorage.getItem(field.key);
      storedData[field.key] = storedValue !== null ? parseFloat(storedValue) : field.defaultValue;
    });
    setFormData(storedData);
  }, []);

  // Handle input change
  const handleInputChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: parseFloat(value)
    }));
  };

  // Save to local storage
  const handleSave = () => {
    Object.keys(formData).forEach((key) => {
      localStorage.setItem(key, formData[key]);
    });
    alert("Configuration saved!");
  };

  // Reset to defaults
  const handleReset = () => {
    const defaultData = {};
    configData.forEach((field) => {
      defaultData[field.key] = field.defaultValue;
    });
    setFormData(defaultData);
  };

  return (
    <form className="space-y-6 text-gray-700">
      {configData.map((field) => (
        <div key={field.key} className="bg-white p-4 rounded shadow-md">
          <label className="block font-medium text-gray-700 mb-2">
            {field.label}
          </label>
          <input
            type="number"
            value={formData[field.key] || ""}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-red-600 mt-2">{field.note}</p>
        </div>
      ))}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Reset to Defaults
        </button>
      </div>
    </form>
  );
};

export default FlakeConfiguration;
