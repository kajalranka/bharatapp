import React, { useState, useEffect, useRef } from "react";
import "./css/BottomSheet.css";
import ParkingBooking from "./ParkingBooking";

const BottomSheet = ({ selectedMarker }) => {
  const [sheetState, setSheetState] = useState("closed"); // "open", "partial", "closed"
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const sheetRef = useRef(null);

  const getTranslateY = () => {
    switch (sheetState) {
      case "open":
        return 0;
      case "partial":
        return 10;
      case "closed":
        return 100;
      default:
        return 100;
    }
  };

  const toggleSheet = () => {
    setSheetState((prev) =>
      prev === "partial" ? "closed" : "partial"
    );
  };

  useEffect(() => {
    if (selectedMarker) {
      setSheetState("partial");
    } else {
      setSheetState("closed");
    }
  }, [selectedMarker]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        setSheetState("closed");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedMarker) return null;

  const {
    BuildingName = "Unknown",
    fullName = "Not Available",
    phoneNumber = "Not Available",
    email = "Not Available",
    address = "Not Available",
    street = "Not Available",
    place = "Not Available",
    zipCode = "Not Available",
    openingTime = "Not Available",
    closingTime = "Not Available",
    vehicleTypes = [],
    pricing = {},
    status = "Unknown",
  } = selectedMarker?.data || {};

  return (
    <div
      className="bottom-sheet-container"
      ref={sheetRef}
      style={{
        transform: `translate(-50%, ${getTranslateY()}%)`,
      }}
    >
      <div className="drag-handle" onClick={toggleSheet}></div>

      <div className="content-container">
        {/* Left - Image Section */}
        <div className="image-container">
          {BuildingName ? (
            <img
              src={`/images/${BuildingName.toLowerCase()}.png`}
              alt={BuildingName}
            />
          ) : (
            <div className="placeholder-image">
              <i className="fas fa-image text-4xl"></i>
              <span>No Image Available</span>
            </div>
          )}
        </div>

        {/* Right - Details Section */}
        <div className="details-container">
          <h1 className="title">{BuildingName}</h1>
          <p><strong>Owner:</strong> {fullName}</p>
          <p><strong>Phone:</strong> {phoneNumber}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Street:</strong> {street}</p>
          <p><strong>Place:</strong> {place}, {zipCode}</p>
          <p><strong>Opening Time:</strong> {openingTime}</p>
          <p><strong>Closing Time:</strong> {closingTime}</p>
          <p><strong>Vehicle Types Allowed:</strong> {Array.isArray(vehicleTypes) ? vehicleTypes.join(", ") : "N/A"}</p>

          {/* Pricing Section */}
          <h3>Pricing</h3>
          <ul className="pricing-list">
            {pricing.hourly && <li><strong>Hourly:</strong> ₹{pricing.hourly}</li>}
            {pricing.daily && <li><strong>Daily:</strong> ₹{pricing.daily}</li>}
            {pricing.weekly && <li><strong>Weekly:</strong> ₹{pricing.weekly}</li>}
            {pricing.monthly && <li><strong>Monthly:</strong> ₹{pricing.monthly}</li>}
          </ul>

          <p><strong>Status:</strong> {status}</p>
        </div>
      </div>

      {/* Book Button */}
      <div className="button-container">
        <button className="book-button1" onClick={() => setIsPopupOpen(true)}>
          Book Parking
        </button>
        <ParkingBooking isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      </div>
    </div>
  );
};

export default BottomSheet;
