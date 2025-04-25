import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { signInWithCredential, PhoneAuthProvider } from 'firebase/auth';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { phoneNumber } = location.state;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    const confirmationResult = JSON.parse(localStorage.getItem("confirmationResult"));

    if (!confirmationResult) {
      setError("Failed to verify OTP. Try again.");
      return;
    }

    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);

    try {
      await signInWithCredential(auth, credential);
      navigate('/home'); // Navigate to the home page after successful login
    } catch (error) {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="otp-verification">
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerifyOTP}>
        <div className="input-field">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <input type="submit" value="Verify OTP" className="btn solid" />
      </form>
    </div>
  );
};

export default OTPVerification;
