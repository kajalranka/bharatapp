import React, { useState, useEffect, useRef } from "react";
import "./css/BottomSheet.css";
import ParkingBooking from "./ParkingBooking";

const BottomSheet = ({ selectedMarker}) => {
  const [translateY, setTranslateY] = useState(80);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const sheetRef = useRef(null);

  const toggleSheet = () => {
    setTranslateY((prev) => (prev === 80 ? 10 : 80));
  };

  useEffect(() => {
    if (selectedMarker) {
      setTranslateY(0);
    }
  }, [selectedMarker]);

  // Close sheet when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        setTranslateY(80);
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
    <div className="bottom-sheet-container" ref={sheetRef} style={{ transform: `translateY(${translateY}%)` }}>
      <div className="drag-handle" onClick={toggleSheet}></div>

      <div className="content-container">
        {/* Left - Image Section */}
        <div className="image-container">
          {BuildingName ? (
            <img src={`/images/${BuildingName.toLowerCase()}.png`} alt={BuildingName} />
          ) : (
            <div className="placeholder-image">
              <i className="fas fa-image text-4xl"></i>
              <span>No Image Available</span>
            </div>
          )}
        </div>

        {/* Right - Details Section */}
        <div className="details-container">
          <h1 className="title">{BuildingName || "Unknown"}</h1>
          <p><strong>Owner:</strong> {fullName || "Not Available"}</p>
          <p><strong>Phone:</strong> {phoneNumber || "Not Available"}</p>
          <p><strong>Email:</strong> {email || "Not Available"}</p>
          <p><strong>Address:</strong> {address || "Not Available"}</p>
          <p><strong>Street:</strong> {street || "Not Available"}</p>
          <p><strong>Place:</strong> {place || "Not Available"}, {zipCode || "Not Available"}</p>
          <p><strong>Opening Time:</strong> {openingTime || "Not Available"}</p>
          <p><strong>Closing Time:</strong> {closingTime || "Not Available"}</p>
          <p><strong>Vehicle Types Allowed:</strong> {Array.isArray(vehicleTypes) ? vehicleTypes.join(", ") : "N/A"}</p>

          {/* Pricing Section */}
          <h3>Pricing</h3>
          <ul className="pricing-list">
            {pricing.hourly && <li><strong>Hourly:</strong> ₹{pricing.hourly}</li>}
            {pricing.daily && <li><strong>Daily:</strong> ₹{pricing.daily}</li>}
            {pricing.weekly && <li><strong>Weekly:</strong> ₹{pricing.weekly}</li>}
            {pricing.monthly && <li><strong>Monthly:</strong> ₹{pricing.monthly}</li>}
          </ul>

          <p><strong>Status:</strong> {status || "Unknown"}</p>
        </div>
      </div>

      {/* ✅ Book Button - Full Width at the Bottom */}
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

// import React, { useState, useEffect, useRef } from "react";
// import "./css/BottomSheet.css";
// import ParkingBooking from "./ParkingBooking";

// const BottomSheet = ({ selectedMarker }) => {
//   const [translateY, setTranslateY] = useState(80);
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const sheetRef = useRef(null);

//   const toggleSheet = () => {
//     setTranslateY((prev) => (prev === 80 ? 10 : 80));
//   };

//   useEffect(() => {
//     if (selectedMarker) {
//       setTranslateY(0);
//     }
//   }, [selectedMarker]);

//   // Close sheet when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (sheetRef.current && !sheetRef.current.contains(event.target)) {
//         setTranslateY(80);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   if (!selectedMarker) return null;

//   const {
//     BuildingName = "Unknown",
//     fullName = "Not Available",
//     phoneNumber = "Not Available",
//     email = "Not Available",
//     address = "Not Available",
//     street = "Not Available",
//     place = "Not Available",
//     zipCode = "Not Available",
//     openingTime = "Not Available",
//     closingTime = "Not Available",
//     vehicleTypes = [],
//     pricing = {},
//     status = "Unknown",
//   } = selectedMarker?.data || {};

//   return (
//     <div className="bottom-sheet-container" ref={sheetRef} style={{ transform: `translateY(${translateY}%)` }}>
//       <div className="drag-handle" onClick={toggleSheet}></div>

//       <div className="content-container">
//         {/* Left - Image Section */}
//         <div className="image-container">
//           {BuildingName ? (
//             <img src={`/images/${BuildingName.toLowerCase()}.png`} alt={BuildingName} />
//           ) : (
//             <div className="placeholder-image">
//               <i className="fas fa-image text-4xl"></i>
//               <span>No Image Available</span>
//             </div>
//           )}
//         </div>

//         {/* Right - Details Section */}
//         <div className="details-container">
//           <h1 className="title">{BuildingName || "Unknown"}</h1>
//           <p><strong>Owner:</strong> {fullName || "Not Available"}</p>
//           <p><strong>Phone:</strong> {phoneNumber || "Not Available"}</p>
//           <p><strong>Email:</strong> {email || "Not Available"}</p>
//           <p><strong>Address:</strong> {address || "Not Available"}</p>
//           <p><strong>Street:</strong> {street || "Not Available"}</p>
//           <p><strong>Place:</strong> {place || "Not Available"}, {zipCode || "Not Available"}</p>
//           <p><strong>Opening Time:</strong> {openingTime || "Not Available"}</p>
//           <p><strong>Closing Time:</strong> {closingTime || "Not Available"}</p>
//           <p><strong>Vehicle Types Allowed:</strong> {Array.isArray(vehicleTypes) ? vehicleTypes.join(", ") : "N/A"}</p>

//           {/* Pricing Section */}
//           <h3>Pricing</h3>
//           <ul className="pricing-list">
//             {pricing.hourly && <li><strong>Hourly:</strong> ₹{pricing.hourly}</li>}
//             {pricing.daily && <li><strong>Daily:</strong> ₹{pricing.daily}</li>}
//             {pricing.weekly && <li><strong>Weekly:</strong> ₹{pricing.weekly}</li>}
//             {pricing.monthly && <li><strong>Monthly:</strong> ₹{pricing.monthly}</li>}
//           </ul>

//           <p><strong>Status:</strong> {status || "Unknown"}</p>
//         </div>
//       </div>

//       {/* ✅ Book Button - Full Width at the Bottom */}
//       <div className="button-container">
//         <button className="book-button1" onClick={() => setIsPopupOpen(true)} disabled={status !== "Available"}>
//           Book Parking
//         </button>
//         <ParkingBooking isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} selectedMarker={selectedMarker} />
//       </div>
//     </div>
//   );
// };

// export default BottomSheet;

