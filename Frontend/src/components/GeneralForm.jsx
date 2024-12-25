import React, { useState, useEffect } from "react";

const GeneralForm = () => {
  const [companyLogo, setCompanyLogo] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    measureUnit: "Microns",
    numImages: 1,
    imageResolution: 1920,
    decimalPoints: 2,
  });

  // Fetch saved data from localStorage if available
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("generalFormData"));
    if (savedData) {
      setFormData(savedData);
      if (savedData.companyLogo) {
        setCompanyLogo(savedData.companyLogo);
      }
    }
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem("generalFormData", JSON.stringify(formData));
    alert("Form data saved!");
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-gray-700 font-medium mb-2">Address Line 2</label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleInputChange}
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
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">State</label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Country</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
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
          value={formData.measureUnit}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="Microns">Microns</option>
          <option value="Inches">Inches</option>
          <option value="Millimeters">Millimeters</option>
        </select>
      </div>

      {/* Number of Images, Resolution */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Number of Images Displayed</label>
        <input
          type="number"
          name="numImages"
          value={formData.numImages}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Image Resolution</label>
        <input
          type="number"
          name="imageResolution"
          value={formData.imageResolution}
          onChange={handleInputChange}
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
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <p className="text-red-500 text-sm mt-1">
          Number of decimal points in the result.
        </p>
      </div>

      {/* Save Button */}
      <div className="col-span-2 mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default GeneralForm;
