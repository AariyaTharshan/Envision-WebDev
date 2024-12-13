import React, { useState } from "react";

const GeneralForm = ({ formData, handleInputChange }) => {
  const [companyLogo, setCompanyLogo] = useState(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCompanyLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form className="grid grid-cols-2 gap-6 text-gray-700">
      {/* Company Name */}
      <div className="col-span-2">
        <label className="block text-gray-700 font-medium mb-2">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={(e) => handleInputChange(e, "general")}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Address Fields */}
      <div className="col-span-2">
        <label className="block text-gray-700 font-medium mb-2">Address Line 1</label>
        <input
          type="text"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-gray-700 font-medium mb-2">Address Line 2</label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* City, State, Country */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">State</label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Country</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Company Logo */}
      <div className="col-span-2">
        <label className="block text-gray-700 font-medium mb-2">Company Logo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="w-full px-4 py-2 border rounded-lg"
        />
        {companyLogo && (
          <div className="mt-4">
            <img
              src={companyLogo}
              alt="Uploaded Logo"
              className="max-h-32 border rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Measure Unit */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Measure Unit</label>
        <select
          name="measureUnit"
          value={formData.measureUnit || "Microns"}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="Microns">Microns</option>
          <option value="Inches">Inches</option>
          <option value="Millimeters">Millimeters</option>
        </select>
      </div>

      {/* Image Fields */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Number of Images Displayed</label>
        <input
          type="number"
          name="numImages"
          value={formData.numImages}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Image Resolution</label>
        <input
          type="number"
          name="imageResolution"
          value={formData.imageResolution}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Decimal Points <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="decimalPoints"
          value={formData.decimalPoints}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">
          Number of decimal points in the result.
        </p>
      </div>

      {/* Image Format */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Image Format</label>
        <select
          name="imageFormat"
          value={formData.imageFormat || "jpg"}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
          <option value="tiff">TIFF</option>
        </select>
      </div>

      {/* Scale Length */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Scale Length</label>
        <input
          type="number"
          name="scaleLength"
          value={formData.scaleLength}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Custom/Standard Report */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Custom/Standard Report</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="reportType"
              value="custom"
              checked={formData.reportType === "custom"}
              onChange={(e) => handleInputChange(e, "general")}
              className="mr-2"
            />
            Custom
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="reportType"
              value="standard"
              checked={formData.reportType === "standard"}
              onChange={(e) => handleInputChange(e, "general")}
              className="mr-2"
            />
            Standard
          </label>
        </div>
      </div>
      {/* Display Font Size */}
      <div>
        <label className="block font-medium mb-2">Display Font Size</label>
        <input
          type="number"
          name="displayFontSize"
          value={formData.displayFontSize || 12}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Report Format */}
        <div>
        <label className="block font-medium mb-2">Report Format</label>
        <select
            name="reportFormat"
            value={formData.reportFormat || "Excel"}
            onChange={(e) => handleInputChange(e, "general")}
            className="w-full px-4 py-2 border rounded-lg"
        >
            <option value="Excel">Excel</option>
            <option value="PDF">PDF</option>
            <option value="CSV">CSV</option>
        </select>
        </div>


      {/* Dark/Light Features */}
      <div>
        <label className="block font-medium mb-2">Dark Feature Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            name="darkFeatureMin"
            value={formData.darkFeatureMin || 0}
            onChange={(e) => handleInputChange(e, "general")}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            name="darkFeatureMax"
            value={formData.darkFeatureMax || 128}
            onChange={(e) => handleInputChange(e, "general")}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Light Feature Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            name="lightFeatureMin"
            value={formData.lightFeatureMin || 129}
            onChange={(e) => handleInputChange(e, "general")}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            name="lightFeatureMax"
            value={formData.lightFeatureMax || 255}
            onChange={(e) => handleInputChange(e, "general")}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Minimum Pixels for Features */}
      <div>
        <label className="block font-medium mb-2">Minimum Pixels for Features</label>
        <input
          type="number"
          name="minPixels"
          value={formData.minPixels || 10}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Circularity Cutoff */}
      <div>
        <label className="block font-medium mb-2">
          Circularity Cutoff <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="circularityCutoff"
          value={formData.circularityCutoff || 0.5}
          step="0.01"
          min="0.01"
          max="0.99"
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">(0 and 1)</p>
      </div>

      {/* Minimum Length for Nodularity */}
      <div>
        <label className="block font-medium mb-2">Minimum Length for Nodularity</label>
        <input
          type="number"
          name="minNodularityLength"
          value={formData.minNodularityLength || 10}
          onChange={(e) => handleInputChange(e, "general")}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </form>
  );
};

export default GeneralForm;