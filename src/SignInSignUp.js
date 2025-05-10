import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import supabase from './supabaseClient';

const SignInSignUp = () => {
  const navigate = useNavigate();
  const [signUpError, setSignUpError] = useState("");
  const [signInError, setSignInError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneToVerify, setPhoneToVerify] = useState("");
  const [tempUserData, setTempUserData] = useState(null);
  
  // Form state
  const [signUpForm, setSignUpForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: ""
  });
  
  const [signInForm, setSignInForm] = useState({
    phone: "",
    password: ""
  });

  // Log any state changes (for debugging)
  useEffect(() => {
    console.log("State updated: showOtpVerification =", showOtpVerification);
    console.log("phoneToVerify =", phoneToVerify);
    console.log("tempUserData =", tempUserData);
  }, [showOtpVerification, phoneToVerify, tempUserData]);

  // Handle form input changes
  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInForm(prev => ({ ...prev, [name]: value }));
  };

  // Step 1: Send OTP via Supabase for signup
  const handleSignUp = async (e) => {
    e.preventDefault();
    console.log("Sign up form submitted");
    setSignUpError("");
    setLoading(true);
  
    const { username, email, phone, password } = signUpForm;
    console.log("Sending OTP to:", phone);
  
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
  
      if (error) throw error;
  
      console.log("OTP sent successfully for signup");
      // Store information for verification step
      setPhoneToVerify(phone);
      setTempUserData({ 
        username, 
        email, 
        phone, 
        password,
        action: 'signup'
      });
      
      // Set flag to show OTP verification UI
      setShowOtpVerification(true);
      console.log("OTP verification flag set to true");
    } catch (error) {
      console.error("OTP send error:", error);
      setSignUpError(error.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };
  
  // Send OTP for sign in
  const handleSignIn = async (e) => {
    e.preventDefault();
    console.log("Sign in form submitted");
    setSignInError("");
    setLoading(true);

    const { phone } = signInForm;
    console.log("Sending sign-in OTP to:", phone);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone
      });
      
      if (error) throw error;
      
      console.log("Sign-in OTP sent successfully");
      // Store information for verification step
      setPhoneToVerify(phone);
      setTempUserData({ 
        phone, 
        action: 'signin' 
      });
      
      // Set flag to show OTP verification UI
      setShowOtpVerification(true);
      console.log("OTP verification flag set to true for signin");
    } catch (error) {
      console.error("Sign-in error:", error);
      setSignInError(error.message || "Invalid phone number.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP for registration
  const verifyOtpAndSignUp = async (e) => {
    e.preventDefault();
    console.log("Verifying OTP for signup");
    setSignUpError("");
    setLoading(true);
  
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneToVerify,
        token: otp,
        type: 'sms',
      });
  
      if (error) throw error;
      
      console.log("OTP verified for signup:", data);
  
      // User is now authenticated with phone, update metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          full_name: tempUserData.username,
          email: tempUserData.email,
          phone: tempUserData.phone
        }
      });
  
      if (updateError) {
        console.warn("Metadata update failed:", updateError.message);
      }
  
      // Store user data locally
      localStorage.setItem("user", JSON.stringify({
        uid: data.user.id,
        email: tempUserData.email,
        displayName: tempUserData.username,
        phone: phoneToVerify,
      }));
  
      alert("Signed up successfully!");
      navigate('/home');
    } catch (error) {
      console.error("OTP verification error:", error);
      setSignUpError(error.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };
  
  // Verify OTP for sign-in
  const verifyOtpForSignIn = async (e) => {
    e.preventDefault();
    console.log("Verifying OTP for signin");
    setSignInError("");
    setLoading(true);
  
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneToVerify,
        token: otp,
        type: 'sms',
      });
  
      if (error) throw error;
      
      console.log("OTP verified for signin:", data);
  
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify({
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.user_metadata?.full_name || '',
        phone: phoneToVerify,
      }));
  
      alert("Logged in successfully!");
      navigate('/home');
    } catch (error) {
      console.error("OTP verification error:", error);
      setSignInError(error.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle back button on OTP screen
  const handleBackFromOtp = () => {
    console.log("Going back from OTP screen");
    setShowOtpVerification(false);
    setOtp("");
    setSignUpError("");
    setSignInError("");
  };

  // Handle panel switching animations
  useEffect(() => {
    // Skip this effect if we're showing OTP verification
    if (showOtpVerification) return;

    const setupPanelSwitching = () => {
      const container = document.querySelector(".container");
      const signInBtn = document.querySelector("#sign-in-btn");
      const signUpBtn = document.querySelector("#sign-up-btn");

      if (!container || !signInBtn || !signUpBtn) {
        console.log("Panel elements not found, will retry");
        setTimeout(setupPanelSwitching, 100);
        return;
      }

      const handleSignUpClick = () => {
        console.log("Sign up panel clicked");
        container.classList.add("sign-up-mode");
      };

      const handleSignInClick = () => {
        console.log("Sign in panel clicked");
        container.classList.remove("sign-up-mode");
      };

      signUpBtn.addEventListener("click", handleSignUpClick);
      signInBtn.addEventListener("click", handleSignInClick);

      return () => {
        signUpBtn.removeEventListener("click", handleSignUpClick);
        signInBtn.removeEventListener("click", handleSignInClick);
      };
    };

    // Setup panel switching with a slight delay
    const cleanup = setupPanelSwitching();
    return cleanup;
  }, [showOtpVerification]);

  // Conditional rendering based on OTP verification state
  if (showOtpVerification) {
    console.log("Rendering OTP verification UI");
    
    return (
      <div className="container otp-container">
        <div className="forms-container">
          <div className="signin-signup">
            <form 
              className="sign-in-form otp-form" 
              onSubmit={tempUserData?.action === 'signin' ? verifyOtpForSignIn : verifyOtpAndSignUp}
            >
              <h2 className="title">Verify Your Phone</h2>
              <p>We've sent a verification code to {phoneToVerify}</p>
              
              <div className="input-field">
                <i className="fas fa-key"></i>
                <input 
                  type="text" 
                  placeholder="Enter OTP" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                />
              </div>
              
              {(signUpError || signInError) && (
                <p className="error-message">{signUpError || signInError}</p>
              )}
              
              <input 
                type="submit" 
                value={loading ? "Verifying..." : "Verify OTP"} 
                className="btn solid" 
                disabled={loading}
              />
              
              <button 
                type="button" 
                className="btn transparent" 
                onClick={handleBackFromOtp}
                disabled={loading}
              >
                Back
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering main sign-in/sign-up UI");

  return (
    <div className="container">
      <div className="forms-container">
        <div className="signin-signup">
          {/* Sign In Form */}
          <form className="sign-in-form" onSubmit={handleSignIn}>
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <i className="fas fa-phone"></i>
              <input 
                type="tel" 
                name="phone"
                placeholder="Phone Number" 
                value={signInForm.phone} 
                onChange={handleSignInChange}
                required 
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={signInForm.password} 
                onChange={handleSignInChange}
              />
            </div>
            {signInError && <p className="error-message">{signInError}</p>}
            <input 
              type="submit" 
              value={loading ? "Signing In..." : "Sign In"} 
              className="btn solid" 
              disabled={loading}
            />
          </form>

          {/* Sign Up Form */}
          <form className="sign-up-form" onSubmit={handleSignUp}>
            <h2 className="title">Sign up</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input 
                type="text" 
                name="username"
                placeholder="Username" 
                value={signUpForm.username} 
                onChange={handleSignUpChange}
                required 
              />
            </div>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={signUpForm.email} 
                onChange={handleSignUpChange}
                required 
              />
            </div>
            <div className="input-field">
              <i className="fas fa-phone"></i>
              <input 
                type="tel" 
                name="phone"
                placeholder="Phone Number" 
                value={signUpForm.phone} 
                onChange={handleSignUpChange}
                required 
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={signUpForm.password} 
                onChange={handleSignUpChange}
                required 
              />
            </div>
            {signUpError && <p className="error-message">{signUpError}</p>}
            <input 
              type="submit" 
              className="btn" 
              value={loading ? "Creating Account..." : "Sign up"} 
              disabled={loading}
            />
          </form>
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here?</h3>
            <p>Join us and discover amazing parking solutions.</p>
            <button className="btn transparent" id="sign-up-btn">Sign up</button>
          </div>
        </div>

        <div className="panel right-panel">
          <div className="content">
            <h3>One of us?</h3>
            <p>Welcome back! Let's get you parked safely.</p>
            <button className="btn transparent" id="sign-in-btn">Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInSignUp;