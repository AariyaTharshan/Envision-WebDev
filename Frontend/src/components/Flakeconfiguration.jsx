import React from "react";

const FlakeConfiguration = ({ formData, handleInputChange }) => {
  const configData = [
    {
      label: "Rosette Flake Radius Factor",
      defaultValue: 0.3,
      note: "This value determines the maximum diameter of the rosette flake. The max diameter will be image diagonal length * factor."
    },
    {
      label: "Rosette Density Factor",
      defaultValue: 0.8,
      note: "The ratio that determines the cut-off for highest flake density."
    },
    {
      label: "Min Rosette Flake Count",
      defaultValue: 15,
      note: "This value determines the minimum number of flakes needed for rosette flakes."
    },
    {
      label: "Min Rosette Star Flake Count",
      defaultValue: 5,
      note: "This value determines the minimum number of flakes for star-like rosettes with multiple edges."
    },
    {
      label: "Min Area % for Star",
      defaultValue: 5,
      note: "This value determines the minimum area % for a flake to qualify as a star flake."
    },
    {
      label: "Type D Flake Ratio",
      defaultValue: 0.8,
      note: "This value determines the ratio for qualifying Type-D flakes."
    },
    {
      label: "Flake Angle Window Size",
      defaultValue: 15,
      note: "This value determines the maximum size of flake angle windows for alignment."
    },
    {
      label: "Flake Uniform Align Ratio",
      defaultValue: 0.66,
      note: "The cut-off value for qualifying flakes as uniformly aligned instead of randomly aligned."
    },
    {
      label: "Max Flake Angle to Rosette Center",
      defaultValue: 15,
      note: "The maximum angle between flake end points and rosette center to consider a part of the rosette."
    },
    {
      label: "Rosette Flake Ratio",
      defaultValue: 0.5,
      note: "The ratio that determines the minimum number of flakes that fall within Max flake angle."
    },
    {
      label: "Flake Rosette Inclusion Ratio",
      defaultValue: 0.75,
      note: "This ratio determines if a flake should be included as part of a rosette."
    },
    {
      label: "Flake Compactness",
      defaultValue: 0.5,
      note: "Defines how compact the flake cluster is."
    },
    {
      label: "Flake Cluster Percentage",
      defaultValue: 75,
      note: "Minimum percentage of flakes to consider as part of the cluster."
    }
  ];

  return (
    <form className="space-y-6 text-gray-700">
      {configData.map((field, index) => (
        <div key={index} className="bg-white p-4 rounded shadow-md">
          <label className="block font-medium text-gray-700 mb-2">
            {field.label}
          </label>
          <input
            type="number"
            defaultValue={field.defaultValue}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-red-600 mt-2">{field.note}</p>
        </div>
      ))}
    </form>
  );
};

export default FlakeConfiguration;
