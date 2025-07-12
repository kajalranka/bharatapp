import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OlaMapComponent from "./OlaMapComponent";
import VehicleFilter from "./VehicleFilter";
import HeaderNavbar from "./HeaderNavbar";
//import LandingPage from "./LandingPage";
//import "./css/LandingPage.css";
import LandingPage from "./LandingPage";
import ParkingBooking from "./ParkingBooking";
import RegistrationForm from "./RegistrationForm";
import SignInSignUp from "./SignInSignUp";
import OtpVerification from "./otp/OtpVerification"; // ✅ Import added
import ParkingOwnerDashboard from "./ownerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignInSignUp />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/home" element={<><HeaderNavbar /><VehicleFilter /><OlaMapComponent /></>} />
        <Route path="/ownerDashboard" element={<ParkingOwnerDashboard/>} />
        <Route path="/parkingbooking" element={<ParkingBooking />} />
        <Route path="/verify-email" element={<OtpVerification />} /> 
      </Routes>
    </Router>
  );
}

export default App;
