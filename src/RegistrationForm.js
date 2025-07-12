import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from './supabaseClient';
import getGeocode from "./Geocoding"; // Importing Geocoding Function
import "./Registration.css";

const RegistrationForm = () => {
  const navigate = useNavigate();
 // const [parkingId] = useState("PARK-" + Math.floor(100000 + Math.random() * 900000));

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
    vehicleType: [], // Changed to array to store multiple vehicle types
    pricingDetails: {}, // Will store pricing details for each vehicle type
    garageImages: [], // Changed to array to handle multiple images
    openingTime: "",
    closingTime: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      if (name === "vehicleTypes") {
        // Handle vehicle type selection
        setFormData((prev) => {
          const updatedVehicleTypes = checked
            ? [...prev.vehicleType, value]
            : prev.vehicleType.filter((v) => v !== value);
          
          // Initialize pricing details for the selected vehicle
          const updatedPricingDetails = { ...prev.pricingDetails };
          
          if (checked) {
            // Add empty pricing details when selecting a vehicle type
            updatedPricingDetails[value] = {
              pricingType: "",
              price: "",
              numberOfSlots: ""
            };
          } else {
            // Remove pricing details when deselecting a vehicle type
            const { [value]: removed, ...rest } = updatedPricingDetails;
            return {
              ...prev,
              vehicleType: updatedVehicleTypes,
              pricingDetails: rest
            };
          }
          
          return {
            ...prev,
            vehicleType: updatedVehicleTypes,
            pricingDetails: updatedPricingDetails
          };
        });
      } else if (name === "termsAccepted") {
        setFormData({ ...formData, [name]: checked });
      }
    } else if (type === "file") {
      setFormData({ ...formData, garageImages: Array.from(files) })
    } else {
      // Handle other input fields
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle pricing type selection
  const handlePricingTypeChange = (vehicleType, value) => {
    setFormData((prev) => ({
      ...prev,
      pricingDetails: {
        ...prev.pricingDetails,
        [vehicleType]: {
          ...prev.pricingDetails[vehicleType],
          pricingType: value
        }
      }
    }));
  };

  // Handle price input
  const handlePriceChange = (vehicleType, value) => {
    setFormData((prev) => ({
      ...prev,
      pricingDetails: {
        ...prev.pricingDetails,
        [vehicleType]: {
          ...prev.pricingDetails[vehicleType],
          price: value
        }
      }
    }));
  };

  // Handle slots input
  const handleSlotsChange = (vehicleType, value) => {
    setFormData((prev) => ({
      ...prev,
      pricingDetails: {
        ...prev.pricingDetails,
        [vehicleType]: {
          ...prev.pricingDetails[vehicleType],
          numberOfSlots: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.termsAccepted) {
      alert("Please fill in all required fields and accept the terms & conditions.");
      return;
    }

    // Check if all selected vehicle types have pricing details
    const hasAllPricingDetails = formData.vehicleType.every(vehicle => {
      const details = formData.pricingDetails[vehicle];
      return details && details.pricingType && details.price && details.numberOfSlots;
    });
    
    if (!hasAllPricingDetails) {
      alert("Please fill in all pricing details for your selected vehicles.");
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

      // Prepare data for Supabase with correct field names
      const ownerData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        street: formData.street,
        zip_code: formData.zipCode,
        city: formData.city,
        address: fullAddress,
        phone_number: formData.phoneNumber,
        email: formData.email,
        terms_accepted: formData.termsAccepted,
        //parking_id: parkingId,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        created_at: new Date().toISOString(),
        state: formData.state // Add state field if needed
      };

      console.log("Submitting Owner Data to Supabase:", ownerData);

      // Insert owner data into Supabase
      const { data: ownerResult, error: ownerError } = await supabase
        .from('owner')
        .insert([ownerData])
        .select();

      if (ownerError) throw ownerError;
      console.log("Owner data inserted successfully:", ownerResult);
      
      const owner_id = ownerResult[0].id;
      
      // Upload garage images
      // Upload garage images (Multi-image support)
    const imageUrls = [];

    if (formData.garageImages && formData.garageImages.length > 0) {
      // Process each image sequentially (avoid rate limits)
      for (let i = 0; i < formData.garageImages.length; i++) {
        const file = formData.garageImages[i];
        if (!file) continue; // Skip if file is undefined

        const fileExt = file.name.split('.').pop();
        const fileName = `${owner_id}_image_${i + 1}.${fileExt}`; // Unique filename per image

        try {
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('garage-images')
            .upload(fileName, file);

          if (uploadError) {
            console.error(`Error uploading image ${i + 1}:`, uploadError);
            continue; // Skip failed uploads (or alert user)
          }

          // Get public URL
          const { data: publicUrlData } = await supabase.storage
            .from('garage-images')
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            imageUrls.push(publicUrlData.publicUrl);
          }
        } catch (error) {
          console.error(`Failed to upload image ${i + 1}:`, error);
        }
      }
    }

    console.log("Uploaded Image URLs:", imageUrls); // Debugging
      
      // Insert owner_slots data for each vehicle type
      for (const vehicleType of formData.vehicleType) {
        const vehicleDetails = formData.pricingDetails[vehicleType];
        
        if (!vehicleDetails) continue;
        
        const slotData = {
          owner_id: owner_id,
          vehicletype: vehicleType,
          pricing_type: vehicleDetails.pricingType,
          price: parseFloat(vehicleDetails.price),
          total_slots: parseInt(vehicleDetails.numberOfSlots),
          parking_image: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
          opening_time: formData.openingTime,
          closing_time: formData.closingTime,
          available_slots: parseInt(vehicleDetails.numberOfSlots),
          status: "available",
          created_at: new Date().toISOString(),
          vehicle_id: formData.vehicleType.indexOf(vehicleType) + 1 // Assigning a sequential ID
        };
        
        console.log(`Inserting slot data for ${vehicleType}:`, slotData);
        
        const { data: slotResult, error: slotError } = await supabase
          .from('owner_slots')
          .insert([slotData])
          .select();
        
        if (slotError) {
          console.error(`Error inserting slot data for ${vehicleType}:`, slotError);
          throw slotError;
        }
        
        console.log(`Slot data for ${vehicleType} inserted successfully:`, slotResult);
      }

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
          {/*<div className="input-group">
            <label>Parking ID</label>
            <input type="text" name="parkingId" value={parkingId} readOnly />
          </div>*/}
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
            <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="input-group">
            <input type="number" name="Flat no" placeholder="Flat No" value={formData.flatno} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input type="number" name="state" placeholder="height of parking(in feet)" value={formData.heightofslot} onChange={handleChange} required/>
          </div>
          <div className="input-group">
            <input type="text" name="buildingName" placeholder="Building-Name & Floor Number" value={formData.buildingName} onChange={handleChange} required/>
          </div>
          <div className="input-group">
            <input type="text" name="street" placeholder="Street-Name & Area Name" value={formData.street} onChange={handleChange} required/>
          </div>
          <div className="input-group">
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required/>
            </div>
          <div className="flex-container">
            <div className="input-group">
              <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required/>
            </div>
            <div className="input-group">
              <input type="text" name="zipCode" placeholder="Pin Code" value={formData.zipCode} onChange={handleChange} required/>
            </div>
          </div> 
          
          <div className="input-group">
            <select required>
              <option>Select Parking Type</option>
              <option>Private steel Parking</option>
              <option>Private Open Parking</option>
              <option>Society Parking</option>
            </select>
          </div>
        </div>

        <div className="right-section">
          <h2>Allowed Vehicle Types</h2>
          <div className="checkbox-group vehicle-types">
            {["Bike/Cycle", "Car/Auto", "Bus/Truck"].map((type) => (
              <label key={type}>
                <input 
                  type="checkbox" 
                  name="vehicleTypes" 
                  value={type} 
                  onChange={handleChange} 
                  checked={formData.vehicleType.includes(type)} 
                  required
                />
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

          {formData.vehicleType.length > 0 && (
            <div className="pricing-section">
              <h2>Pricing Options</h2>
              
              {formData.vehicleType.map(vehicleType => (
                <div key={vehicleType} className="vehicle-pricing">
                  <h3>{vehicleType} Pricing</h3>
                  
                  <div className="input-group">
                    <label>Pricing Type</label>
                    <select 
                      value={formData.pricingDetails[vehicleType]?.pricingType || ""}
                      onChange={(e) => handlePricingTypeChange(vehicleType, e.target.value)}
                      required
                    >
                      <option value="">Select Pricing Type</option>
                      <option value="Hourly">Hourly</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div className="input-group">
                    <label>Price (in Rupees)</label>
                    <input 
                      type="number" 
                      value={formData.pricingDetails[vehicleType]?.price || ""} 
                      onChange={(e) => handlePriceChange(vehicleType, e.target.value)}
                      min="0" 
                      placeholder="In Rupees" 
                      required 
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>Number of Slots</label>
                    <input
                      type="number"
                      placeholder="Enter number of slots"
                      value={formData.pricingDetails[vehicleType]?.numberOfSlots || ""}
                      onChange={(e) => handleSlotsChange(vehicleType, e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          )}   

          <div className="input-group">
            <label>Upload Garage Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Upload NOC letter</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Upload Address Proof</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Upload Parking Slot Ownership proof </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              required
            />
          </div>
          
          {formData.garageImages.length > 0 && (
            <div className="image-preview">
              {formData.garageImages.map((file, index) => (
                <img 
                  key={index} 
                  src={URL.createObjectURL(file)} 
                  alt={`Preview ${index + 1}`} 
                  width="100" 
                  required
                />
              ))}
            </div>
          )}

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