import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from './supabaseClient';
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
    city: "",
    buildingName: "",
    phoneNumber: "",
    email: "",
    termsAccepted: false,
    vehicleTypes: [],
    // Store pricing for each vehicle type separately
    bike_cycle: {},
    car_auto: {},
    bus_truck: {},
    numberOfSlots: '',
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
      } else if (name.startsWith("pricingType_")) {
        const [_, vehicleType, priceType] = name.split("_");
        
        // Convert vehicle type to the corresponding state field
        const vehicleField = getVehicleField(vehicleType);
        
        setFormData((prev) => {
          const updatedVehiclePricing = { ...prev[vehicleField] };
          
          if (checked) {
            updatedVehiclePricing[priceType] = "";
          } else {
            const { [priceType]: removed, ...rest } = updatedVehiclePricing;
            return { 
              ...prev, 
              [vehicleField]: rest 
            };
          }
          
          return { 
            ...prev, 
            [vehicleField]: updatedVehiclePricing 
          };
        });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Helper function to convert vehicle type to field name
  const getVehicleField = (vehicleType) => {
    switch(vehicleType) {
      case "Bike/Cycle": return "bike_cycle";
      case "Car/Auto": return "car_auto";
      case "Bus/Truck": return "bus_truck";
      default: return "";
    }
  };

  // Helper function to convert field name to vehicle type
  const getVehicleType = (fieldName) => {
    switch(fieldName) {
      case "bike_cycle": return "Bike/Cycle";
      case "car_auto": return "Car/Auto";
      case "bus_truck": return "Bus/Truck";
      default: return "";
    }
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    const [vehicleType, priceType] = name.split("_");
    
    // Get the corresponding field name for the vehicle type
    const vehicleField = getVehicleField(vehicleType);
    
    if (vehicleField) {
      setFormData((prev) => ({
        ...prev,
        [vehicleField]: {
          ...prev[vehicleField],
          [priceType]: value
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.termsAccepted) {
      alert("Please fill in all required fields and accept the terms & conditions.");
      return;
    }

    // Check if at least one pricing option is selected for selected vehicle types
    const hasPricing = formData.vehicleTypes.some(vehicle => {
      const vehicleField = getVehicleField(vehicle);
      return Object.keys(formData[vehicleField] || {}).length > 0;
    });
    
    if (!hasPricing) {
      alert("Please select at least one pricing type for your selected vehicles.");
      return;
    }

    setLoading(true);
    try {
      // Generate Full Address
      const fullAddress = `${formData.buildingName}, ${formData.street}, ${formData.city}, ${formData.zipCode}`;
      console.log("Full Address for Geocoding:", fullAddress);

      // Get Coordinates from Address
      const coordinates = await getGeocode(fullAddress);
      console.log("Geocode API Response:", coordinates);

      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        alert("Failed to get valid location coordinates. Please check the address.");
        setLoading(false);
        return;
      }

      const bikeCyclePricing = formData.vehicleTypes.includes("Bike/Cycle") 
      ? [formData.bike_cycle]
      : [];
    
    const carAutoPricing = formData.vehicleTypes.includes("Car/Auto") 
      ? [formData.car_auto]
      : [];
    
    const busTruckPricing = formData.vehicleTypes.includes("Bus/Truck") 
      ? [formData.bus_truck]
      : [];
    
      console.log("Bike/Cycle pricing:", bikeCyclePricing);
      console.log("Car/Auto pricing:", carAutoPricing);
      console.log("Bus/Truck pricing:", busTruckPricing);
      
      // Prepare data for Supabase with correct field names
      const supabaseData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        street: formData.street,
        zip_code: formData.zipCode,
        city: formData.city,
        address: fullAddress,
        phone_number: formData.phoneNumber,
        email: formData.email,
        terms_accepted: formData.termsAccepted,
        vehicle_types: formData.vehicleTypes,
        
        // Store each vehicle type pricing in its own separate column
        bike_cycle: bikeCyclePricing,
        car_auto: carAutoPricing,
        bus_truck: busTruckPricing,
        
        opening_time: formData.openingTime,
        closing_time: formData.closingTime,
        
        // Additional fields that need to be added to your Supabase table
        parking_id: parkingId,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        status: "Available",
        created_at: new Date().toISOString(),
        total_slots: formData.numberOfSlots,
      };

      console.log("Submitting Data to Supabase:", supabaseData);

      // Store in Supabase - make sure table name matches exactly
      const { error } = await supabase
        .from('form_data')
        .insert([supabaseData]);

      if (error) throw error;

      alert("Registration successful!");
      navigate("/home");
    } catch (error) {
      console.error("Supabase Error:", error);
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
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
            </div>
          </div>
          <div className="input-group">
            <input type="text" name="buildingName" placeholder="Building-Name & Floor Number" value={formData.buildingName} onChange={handleChange} />
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
          <div className="checkbox-group vehicle-types">
            {["Bike/Cycle", "Car/Auto", "Bus/Truck"].map((type) => (
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

          {formData.vehicleTypes.length > 0 && (
            <div className="pricing-section">
              <h2>Pricing Options</h2>
              
              {formData.vehicleTypes.map(vehicleType => {
                const vehicleField = getVehicleField(vehicleType);
                return (
                  <div key={vehicleType} className="vehicle-pricing">
                    <h3>{vehicleType} Pricing</h3>
                    
                    <div className="checkbox-group pricing-types">
                      {["hourly", "daily", "weekly", "monthly"].map((type) => (
                        <label key={`${vehicleType}-${type}`} className="pricing-type-label">
                          <input 
                            type="checkbox" 
                            name={`pricingType_${vehicleType}_${type}`} 
                            onChange={handleChange} 
                            checked={Object.keys(formData[vehicleField] || {}).includes(type)} 
                          />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </label>
                      ))}
                    </div>
                    
                    <div className="price-inputs">
                      {Object.keys(formData[vehicleField] || {}).map((priceType) => (
                        <div key={`${vehicleType}-${priceType}`} className="input-group price-input">
                          <label>{priceType.charAt(0).toUpperCase() + priceType.slice(1)} Price</label>
                          <input 
                            type="number" 
                            name={`${vehicleType}_${priceType}`} 
                            value={formData[vehicleField][priceType]} 
                            onChange={handlePricingChange} 
                            min="0" 
                            required 
                            placeholder="In Rupees" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="input-group">
            <label>Number of Slots</label>
            <input
              type="number"
              name="numberOfSlots"
              placeholder="Enter number of slots"
              value={formData.numberOfSlots}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

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