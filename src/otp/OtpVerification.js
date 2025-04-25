
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OtpVerification.css'; // You'll need to create this CSS file

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData.email) {
      navigate('/');
      return;
    }
    
    setUserEmail(userData.email);
    
    // Set up interval to check email verification status
    const checkVerificationStatus = async () => {
      try {
        // Load Firebase modules
        const { initializeApp } = await import('firebase/app');
        const { getAuth, onAuthStateChanged, reload } = await import('firebase/auth');
        const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
        const firebaseConfig = (await import('./firebasecon')).default;
        
        // Initialize Firebase
        let app;
        try {
          app = initializeApp(firebaseConfig);
        } catch (err) {
          const { getApp } = await import('firebase/app');
          app = getApp();
        }
        
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        // Check if user is authenticated
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Reload user to get latest emailVerified status
            await reload(user);
            
            if (user.emailVerified) {
              // Update user data in Firestore
              await updateDoc(doc(db, "users", user.uid), {
                emailVerified: true
              });
              
              // Update localStorage
              const userData = JSON.parse(localStorage.getItem('user'));
              userData.emailVerified = true;
              localStorage.setItem('user', JSON.stringify(userData));
              
              alert("Email verification successful! You can now use all features.");
              navigate('/home');
            }
          }
        });
      } catch (error) {
        console.error("Verification check error:", error);
      }
    };
    
    // Check status initially and every 5 seconds
    checkVerificationStatus();
    const interval = setInterval(checkVerificationStatus, 5000);
    
    // Set up countdown timer for resend button
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setCanResend(true);
          clearInterval(countdown);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    // Clean up intervals
    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [navigate]);

  // Handle resend verification email
  const handleResendEmail = async () => {
    if (!canResend) return;
    
    setError('');
    setLoading(true);
    setCanResend(false);
    setTimer(60);
    
    try {
      // Load Firebase modules
      const { initializeApp } = await import('firebase/app');
      const { getAuth, sendEmailVerification } = await import('firebase/auth');
      const firebaseConfig = (await import('./firebasecon')).default;
      
      // Initialize Firebase
      let app;
      try {
        app = initializeApp(firebaseConfig);
      } catch (err) {
        const { getApp } = await import('firebase/app');
        app = getApp();
      }
      
      const auth = getAuth(app);
      
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        alert("Verification email resent successfully!");
        
        // Reset countdown
        const countdown = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer <= 1) {
              setCanResend(true);
              clearInterval(countdown);
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
      } else {
        throw new Error("You need to be signed in to resend the verification email.");
      }
    } catch (error) {
      console.error("Resend email error:", error);
      setError(error.message || "Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual verification refresh
  const handleRefreshStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load Firebase modules
      const { initializeApp } = await import('firebase/app');
      const { getAuth, reload } = await import('firebase/auth');
      const firebaseConfig = (await import('./firebasecon')).default;
      
      // Initialize Firebase
      let app;
      try {
        app = initializeApp(firebaseConfig);
      } catch (err) {
        const { getApp } = await import('firebase/app');
        app = getApp();
      }
      
      const auth = getAuth(app);
      
      if (auth.currentUser) {
        await reload(auth.currentUser);
        
        if (auth.currentUser.emailVerified) {
          // Update localStorage
          const userData = JSON.parse(localStorage.getItem('user'));
          userData.emailVerified = true;
          localStorage.setItem('user', JSON.stringify(userData));
          
          alert("Email verification confirmed! Redirecting to home page.");
          navigate('/home');
        } else {
          alert("Email not verified yet. Please check your inbox and click the verification link.");
        }
      } else {
        throw new Error("You need to be signed in to check verification status.");
      }
    } catch (error) {
      console.error("Refresh status error:", error);
      setError(error.message || "Failed to check verification status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-verification-container">
      <div className="verification-card">
        <h2>Verify Your Email</h2>
        <p className="info-text">
          We've sent a verification email to:
          <br />
          <strong>{userEmail}</strong>
        </p>
        
        <div className="verification-instructions">
          <p>Please check your inbox and click the verification link in the email to verify your account.</p>
          <p>If you don't see the email, check your spam folder.</p>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="verification-actions">
          <button 
            className="verify-btn" 
            onClick={handleRefreshStatus}
            disabled={loading}
          >
            {loading ? "Checking..." : "I've Verified My Email"}
          </button>
          
          <button 
            className={`resend-btn ${!canResend ? 'disabled' : ''}`}
            onClick={handleResendEmail}
            disabled={!canResend || loading}
          >
            {canResend ? "Resend Verification Email" : `Resend in ${timer}s`}
          </button>
        </div>
        
        <button className="back-to-signin" onClick={() => navigate('/')}>
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;


// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import './OtpVerification.css';

// const VerifyOtp = () => {
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   // Get state from navigation
//   const { phone, isSignUp } = location.state || {};

//   // Focus on first input when component mounts
//   useEffect(() => {
//     document.getElementById('otp-0')?.focus();
//   }, []);

//   // Handle input changes
//   const handleChange = (e, index) => {
//     if (e.target.value.length > 1) {
//       // If pasting multiple digits
//       const digits = e.target.value.split('').slice(0, 6);
//       const newOtp = [...otp];
      
//       digits.forEach((digit, i) => {
//         if (index + i < 6) {
//           newOtp[index + i] = digit;
//         }
//       });
      
//       setOtp(newOtp);
      
//       // Focus on next input after pasting
//       const nextIndex = Math.min(index + digits.length, 5);
//       document.getElementById(`otp-${nextIndex}`)?.focus();
//     } else {
//       // Handle single digit input
//       const newOtp = [...otp];
//       newOtp[index] = e.target.value;
//       setOtp(newOtp);
      
//       // Auto-focus to next input
//       if (e.target.value && index < 5) {
//         document.getElementById(`otp-${index + 1}`)?.focus();
//       }
//     }
//   };

//   // Handle backspace
//   const handleKeyDown = (e, index) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       // Focus on previous input when backspace is pressed on empty input
//       document.getElementById(`otp-${index - 1}`)?.focus();
//     }
//   };

//   // Handle OTP verification for sign-up
//   const handleVerify = async () => {
//     setError('');
//     setLoading(true);
    
//     const enteredOtp = otp.join('');
    
//     if (enteredOtp.length !== 6) {
//       setError('Please enter the complete 6-digit OTP');
//       setLoading(false);
//       return;
//     }

//     try {
//       if (!window.confirmationResult) {
//         throw new Error('Authentication session expired. Please try again.');
//       }
      
//       // Confirm the verification code
//       const userCredential = await window.confirmationResult.confirm(enteredOtp);
      
//       // Get the stored user data
//       const pendingUserData = JSON.parse(localStorage.getItem('pendingUserData'));
      
//       if (!pendingUserData) {
//         throw new Error('User data not found. Please try signing up again.');
//       }
      
//       // Load Firebase modules
//       const { initializeApp } = await import('firebase/app');
//       const { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } = await import('firebase/auth');
//       const { getFirestore, doc, setDoc } = await import('firebase/firestore');
//       const firebaseConfig = (await import('./firebasecon')).default;
      
//       // Initialize Firebase
//       let app;
//       try {
//         app = initializeApp(firebaseConfig);
//       } catch (err) {
//         const { getApp } = await import('firebase/app');
//         app = getApp();
//       }
      
//       const auth = getAuth(app);
//       const db = getFirestore(app);
      
//       // Sign out from the phone auth
//       await signOut(auth);
      
//       // Create user with email and password
//       const newUserCredential = await createUserWithEmailAndPassword(
//         auth, 
//         pendingUserData.email, 
//         pendingUserData.password
//       );
      
//       // Update the user profile
//       await updateProfile(newUserCredential.user, {
//         displayName: pendingUserData.username
//       });
      
//       // Store additional user information in Firestore
//       await setDoc(doc(db, "users", newUserCredential.user.uid), {
//         username: pendingUserData.username,
//         email: pendingUserData.email,
//         phone: userCredential.user.phoneNumber, // Verified phone from OTP
//         createdAt: new Date()
//       });
      
//       // Remove temporary data
//       localStorage.removeItem('pendingUserData');
      
//       // Save user info to localStorage
//       localStorage.setItem('user', JSON.stringify({
//         uid: newUserCredential.user.uid,
//         displayName: pendingUserData.username,
//         email: pendingUserData.email,
//         phone: userCredential.user.phoneNumber
//       }));
      
//       alert("Account created successfully!");
      
//       // Navigate to home page
//       navigate('/home');
//     } catch (error) {
//       console.error("Verification error:", error);
//       setError(error.message || 'Verification failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle resend OTP
//   const handleResendOtp = async () => {
//     setError('');
    
//     try {
//       // Load Firebase modules
//       const { initializeApp } = await import('firebase/app');
//       const { getAuth, signInWithPhoneNumber, RecaptchaVerifier } = await import('firebase/auth');
//       const firebaseConfig = (await import('./firebasecon')).default;
      
//       // Initialize Firebase
//       let app;
//       try {
//         app = initializeApp(firebaseConfig);
//       } catch (err) {
//         const { getApp } = await import('firebase/app');
//         app = getApp();
//       }
      
//       const auth = getAuth(app);
      
//       // Reset reCAPTCHA
//       if (window.recaptchaVerifier) {
//         window.recaptchaVerifier.clear();
//       }
      
//       // Create new reCAPTCHA
//       window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
//         'size': 'invisible'
//       });
      
//       const appVerifier = window.recaptchaVerifier;
//       const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
//       window.confirmationResult = confirmationResult;
      
//       alert('OTP resent successfully');
//     } catch (error) {
//       console.error("Resend OTP error:", error);
//       setError(error.message || 'Failed to resend OTP');
//     }
//   };

//   return (
//     <div className="otp-container">
//       <div className="otp-card">
//         <h2>Phone Verification</h2>
//         <p>
//           Enter the verification code sent to{' '}
//           <strong>{phone}</strong>
//         </p>
        
//         <div className="otp-input-container">
//           {otp.map((digit, index) => (
//             <input
//               key={index}
//               id={`otp-${index}`}
//               type="text"
//               inputMode="numeric"
//               pattern="[0-9]*"
//               maxLength="1"
//               className="otp-input"
//               value={digit}
//               onChange={(e) => handleChange(e, index)}
//               onKeyDown={(e) => handleKeyDown(e, index)}
//             />
//           ))}
//         </div>
        
//         {error && <p className="error-message">{error}</p>}
        
//         <button 
//           className="verify-btn" 
//           onClick={handleVerify}
//           disabled={loading}
//         >
//           {loading ? 'Verifying...' : 'Create Account'}
//         </button>
        
//         <p className="resend-text">
//           Didn't receive the code?{' '}
//           <span className="resend-link" onClick={handleResendOtp}>
//             Resend OTP
//           </span>
//         </p>
        
//         <div id="recaptcha-container"></div>
//       </div>
//     </div>
//   );
// };

// export default VerifyOtp;