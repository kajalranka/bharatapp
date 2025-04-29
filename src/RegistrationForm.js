import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebasecon";
import { collection, addDoc } from "firebase/firestore";
import getGeocode from "./Geocoding"; // Importing Geocoding Function
import "./Registration.css";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [parkingId] = useState("PARK-" + Math.floor(100000 + Math.random() * 900000));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    zipCode: "",
    place: "",
    BuildinName: "",
    phoneNumber: "",
    email: "",
    termsAccepted: false,
    vehicleTypes: [],
    pricing: {},
    openingTime: "",
    closingTime: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "vehicleTypes") {
        setFormData((prev) => ({
          ...prev,
          vehicleTypes: checked
            ? [...prev.vehicleTypes, value]
            : prev.vehicleTypes.filter((v) => v !== value),
        }));
      } else if (name === "pricingType") {
        setFormData((prev) => ({
          ...prev,
          pricing: checked
            ? { ...prev.pricing, [value]: "" }
            : Object.fromEntries(Object.entries(prev.pricing).filter(([key]) => key !== value)),
        }));
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.termsAccepted) {
      alert("Please fill in all required fields and accept the terms & conditions.");
      return;
    }

    if (Object.keys(formData.pricing).length === 0) {
      alert("Please select at least one pricing type.");
      return;
    }

    setLoading(true);
    try {
      // 🔥 Generate Full Address
      const fullAddress = `${formData.BuildinName}, ${formData.street}, ${formData.place}, ${formData.zipCode}`;
      console.log("Full Address for Geocoding:", fullAddress);

      // 🔥 Get Coordinates from Address
      const coordinates = await getGeocode(fullAddress);
      console.log("Geocode API Response:", coordinates);

      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        alert("Failed to get valid location coordinates. Please check the address.");
        setLoading(false);
        return;
      }

      // 🔥 Prepare Final Data
      const finalData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`,
        address: fullAddress,
        latitude: coordinates.lat, // Ensure correct key names
        longitude: coordinates.lng,
        parkingId,
        status: "Available",
        timestamp: new Date(),
      };

      console.log("Submitting Data to Firestore:", finalData); // Debugging Log

      // 🔥 Store in Firestore
      await addDoc(collection(db, "owners"), finalData);

      alert("Registration successful!");
      navigate("/home");
    } catch (error) {
      console.error("Firestore Error:", error);
      alert(`Failed to register. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="registration-wrapper" onSubmit={handleSubmit}>
      <div className="registration-container">
        <div className="left-section">
          <h2>General Information</h2>
          <div className="input-group">
            <label>Parking ID</label>
            <input type="text" name="parkingId" value={parkingId} readOnly />
          </div>
          <div className="flex-container">
            <div className="input-group">
              <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>

          <h2>Contact Details</h2>
          <div className="input-group">
            <input type="text" name="street" placeholder="Street-Name & Area Name" value={formData.street} onChange={handleChange} />
          </div>
          <div className="flex-container">
            <div className="input-group">
              <input type="text" name="zipCode" placeholder="Pin Code" value={formData.zipCode} onChange={handleChange} />
            </div>
            <div className="input-group">
              <input type="text" name="place" placeholder="City" value={formData.place} onChange={handleChange} />
            </div>
          </div>
          <div className="input-group">
            <input type="text" name="BuildinName" placeholder="Building-Name & Floor Number" value={formData.BuildinName} onChange={handleChange} />

          </div>
          <div className="input-group">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
          </div>
        </div>

        <div className="right-section">
          <h2>Allowed Vehicle Types</h2>
          <div className="checkbox-group">
            {["Bike", "Micro", "Mini", "Large", "Auto", "Bus"].map((type) => (
              <label key={type}>
                <input type="checkbox" name="vehicleTypes" value={type} onChange={handleChange} checked={formData.vehicleTypes.includes(type)} />
                {type}
              </label>
            ))}
          </div>

          <h2>Operating Hours</h2>
          <div className="flex-container">
            <div className="input-group">
              <label>Opening Time</label>
              <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Closing Time</label>
              <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} required />
            </div>
          </div>

          <h2>Select Pricing Type</h2>
          <div className="checkbox-group">
            {["hourly", "daily", "weekly", "monthly"].map((type) => (
              <label key={type}>
                <input type="checkbox" name="pricingType" value={type} onChange={handleChange} checked={Object.keys(formData.pricing).includes(type)} />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>

          {Object.keys(formData.pricing).map((type) => (
            <div key={type} className="input-group">
              <label>{type.charAt(0).toUpperCase() + type.slice(1)} Price</label>
              <input type="number" name={type} value={formData.pricing[type]} onChange={handlePricingChange} min="0" required placeholder="In Rupees" />
            </div>
          ))}

          <div className="checkbox-group">
            <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} required />
            <label>I accept the Terms & Conditions</label>
          </div>

          <button id="Button1" type="submit" disabled={loading}>{loading ? "Registering..." : "Register Owner"}</button>
          <button id="Button2" type="button" onClick={() => navigate("/home")}>Skip Registration</button>
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;
