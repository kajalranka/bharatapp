

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import { sendEmailVerification } from "firebase/auth";


const SignInSignUp = () => {
  const navigate = useNavigate();
  const [signUpError, setSignUpError] = useState("");
  const [signInError, setSignInError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkElements = () => {
      const container = document.querySelector(".container");
      const signInBtn = document.querySelector("#sign-in-btn");
      const signUpBtn = document.querySelector("#sign-up-btn");

      if (!container || !signInBtn || !signUpBtn) return;

      signUpBtn.addEventListener("click", () => container.classList.add("sign-up-mode"));
      signInBtn.addEventListener("click", () => container.classList.remove("sign-up-mode"));

      return () => {
        signUpBtn.removeEventListener("click", () => {});
        signInBtn.removeEventListener("click", () => {});
      };
    };

    setTimeout(checkElements, 100);
  }, []);

  // Sign-Up Function with email verification
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError("");
    setLoading(true);

    const username = e.target[0].value;
    const email = e.target[1].value;
    const phone = e.target[2].value;
    const password = e.target[3].value;

    try {
      // Load Firebase modules
      const { initializeApp } = await import('firebase/app');
      const { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = await import('firebase/auth');
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
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
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile
      await updateProfile(userCredential.user, {
        displayName: username
      });
      
      // Store user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username,
        email,
        phone,
        emailVerified: false,
        createdAt: new Date()
      });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Save user info to localStorage
      localStorage.setItem("user", JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: username,
        phone: phone,
        emailVerified: false
      }));
      
      // Notify user and redirect to verification page
      alert("Account created! Please check your email to verify your account.");
      navigate('/verify-email');
    } catch (error) {
      console.error("Sign-up error:", error);
      setSignUpError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Sign-In Function with email and password
  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInError("");
    setLoading(true);

    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      // Load Firebase modules
      const { initializeApp } = await import('firebase/app');
      const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
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
      
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Get user data from Firestore to check if verification is required
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        const userData = userDoc.data();
        
        // If we're enforcing verification and user hasn't verified yet
        if (userData && userData.emailVerified === false) {
          // Send a new verification email
          await sendEmailVerification(userCredential.user);
          
          localStorage.setItem("user", JSON.stringify({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            phone: userData.phone,
            emailVerified: false
          }));
          
          alert("Please verify your email before signing in. A new verification email has been sent.");
          navigate('/verify-email');
          return;
        }
      }
      
      // Email is verified or verification not required
      localStorage.setItem("user", JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified
      }));
      
      // Navigate to home page
      navigate('/home');
    } catch (error) {
      console.error("Sign-in error:", error);
      setSignInError(error.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="forms-container">
        <div className="signin-signup">

          {/* Sign In Form */}
          <form className="sign-in-form" onSubmit={handleSignIn}>
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input type="email" placeholder="Email" required />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input type="password" placeholder="Password" required />
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
              <input type="text" placeholder="Username" required />
            </div>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input type="email" placeholder="Email" required />
            </div>
            <div className="input-field">
              <i className="fas fa-phone"></i>
              <input type="tel" placeholder="Phone Number" required />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input type="password" placeholder="Password" required />
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



// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Signup.css';

// const SignInSignUp = () => {
//   const navigate = useNavigate();
//   const [signUpError, setSignUpError] = useState("");
//   const [signInError, setSignInError] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");

//   useEffect(() => {
//     const checkElements = () => {
//       const container = document.querySelector(".container");
//       const signInBtn = document.querySelector("#sign-in-btn");
//       const signUpBtn = document.querySelector("#sign-up-btn");

//       if (!container || !signInBtn || !signUpBtn) return;

//       signUpBtn.addEventListener("click", () => container.classList.add("sign-up-mode"));
//       signInBtn.addEventListener("click", () => container.classList.remove("sign-up-mode"));

//       return () => {
//         signUpBtn.removeEventListener("click", () => {});
//         signInBtn.removeEventListener("click", () => {});
//       };
//     };

//     setTimeout(checkElements, 100);
//   }, []);

//   // Sign-Up Function with phone verification
//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     setSignUpError("");

//     const username = e.target[0].value;
//     const email = e.target[1].value;
//     const phone = e.target[2].value;
//     const password = e.target[3].value;

//     // Validate phone number
//     if (!phone.startsWith('+')) {
//       setSignUpError("Phone number must include country code (e.g., +1)");
//       return;
//     }

//     try {
//       // Load Firebase modules
//       const { initializeApp } = await import('firebase/app');
//       const { getAuth, RecaptchaVerifier } = await import('firebase/auth');
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
      
//       // Setup invisible reCAPTCHA
//       window.recaptchaVerifier = new RecaptchaVerifier(auth, 'signup-recaptcha-container', {
//         'size': 'invisible',
//       });
      
//       const appVerifier = window.recaptchaVerifier;
      
//       // Store user data for later use after OTP verification
//       const userData = {
//         username,
//         email,
//         phone,
//         password,
//         isSignUp: true
//       };
      
//       // Initialize phone auth and send OTP
//       const { signInWithPhoneNumber } = await import('firebase/auth');
//       const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
//       window.confirmationResult = confirmationResult;
      
//       // Store user data temporarily
//       localStorage.setItem("pendingUserData", JSON.stringify(userData));
      
//       alert("OTP sent to your phone. Please verify to complete signup.");
//       navigate('/verify-otp', { state: { phone, isSignUp: true } });
//     } catch (error) {
//       console.error("Sign-up error:", error);
//       setSignUpError(error.message || "Failed to start phone verification. Please try again.");
      
//       // Reset reCAPTCHA if there was an error
//       if (window.recaptchaVerifier) {
//         window.recaptchaVerifier.clear();
//         window.recaptchaVerifier = null;
//       }
//     }
//   };

//   // Regular Sign-In Function with email/password
//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setSignInError("");

//     const email = e.target[0].value;
//     const password = e.target[1].value;

//     try {
//       // Load Firebase modules
//       const { initializeApp } = await import('firebase/app');
//       const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
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
      
//       // Sign in with email and password
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
//       // Save user info
//       localStorage.setItem("user", JSON.stringify({
//         uid: userCredential.user.uid,
//         email: userCredential.user.email,
//         displayName: userCredential.user.displayName,
//         phone: userCredential.user.phoneNumber
//       }));
      
//       // Navigate to home page
//       navigate('/home');
//     } catch (error) {
//       console.error("Sign-in error:", error);
//       setSignInError(error.message || "Invalid email or password. Please try again.");
//     }
//   };

//   return (
//     <div className="container">
//       <div className="forms-container">
//         <div className="signin-signup">

//           {/* Sign In Form */}
//           <form className="sign-in-form" onSubmit={handleSignIn}>
//             <h2 className="title">Sign in</h2>
//             <div className="input-field">
//               <i className="fas fa-envelope"></i>
//               <input type="email" placeholder="Email" required />
//             </div>
//             <div className="input-field">
//               <i className="fas fa-lock"></i>
//               <input type="password" placeholder="Password" required />
//             </div>
//             {signInError && <p className="error-message">{signInError}</p>}
//             <input type="submit" value="Sign In" className="btn solid" />
//           </form>

//           {/* Sign Up Form */}
//           <form className="sign-up-form" onSubmit={handleSignUp}>
//             <h2 className="title">Sign up</h2>
//             <div className="input-field">
//               <i className="fas fa-user"></i>
//               <input type="text" placeholder="Username" required />
//             </div>
//             <div className="input-field">
//               <i className="fas fa-envelope"></i>
//               <input type="email" placeholder="Email" required />
//             </div>
//             <div className="input-field">
//               <i className="fas fa-phone"></i>
//               <input 
//                 type="tel" 
//                 placeholder="Phone Number (with country code, e.g. +1)" 
//                 required 
//               />
//             </div>
//             <div className="input-field">
//               <i className="fas fa-lock"></i>
//               <input type="password" placeholder="Password" required />
//             </div>
//             {signUpError && <p className="error-message">{signUpError}</p>}
//             <input type="submit" className="btn" value="Send OTP" />
//             <div id="signup-recaptcha-container"></div>
//           </form>
//         </div>
//       </div>

//       <div className="panels-container">
//         <div className="panel left-panel">
//           <div className="content">
//             <h3>New here?</h3>
//             <p>Join us and discover amazing parking solutions.</p>
//             <button className="btn transparent" id="sign-up-btn">Sign up</button>
//           </div>
//         </div>

//         <div className="panel right-panel">
//           <div className="content">
//             <h3>One of us?</h3>
//             <p>Welcome back! Let's get you parked safely.</p>
//             <button className="btn transparent" id="sign-in-btn">Sign in</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignInSignUp;