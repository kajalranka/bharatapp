import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; // Import Firebase Storage
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier ,signInWithPhoneNumber} from "firebase/auth"; // ✅ Import getAuth

const firebaseConfig = {
  apiKey: "AIzaSyCy2MIi5ZKXeQvaZIWuE0JZpkuBqRweuEk",
  authDomain: "leaseparking-4a32c.firebaseapp.com",
  projectId: "leaseparking-4a32c",
  storageBucket: "leaseparking-4a32c.appspot.com",
  messagingSenderId: "791031793539",
  appId: "1:791031793539:web:60a8f0e1747784d7ee58b6",
  measurementId: "G-TEJMHVS89M"
};

// Initialize Firebase
// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ✅ Initialize Authentication
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export Firebase instances
export { app, auth, db, storage, RecaptchaVerifier,signInWithPhoneNumber }; 