// firebase.js (or firebaseConfig.js)
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDb3O_95tN52wH6YDbueI8pj21y-7R49Lg",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "alignify-d100d.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "alignify-d100d",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "alignify-d100d.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "266537613273",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:266537613273:web:aad966fc08863bf14ecbc8",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-ZS1DFM8V3B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and set persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Initialize Firestore with offline persistence
const db = getFirestore(app);
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Offline persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
      console.warn("The current browser does not support offline persistence.");
    }
  });

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics (only in client-side)
let analytics;
let performance;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  performance = getPerformance(app);
}

// Export all initialized services
export { 
  app, 
  auth, 
  db, 
  storage,
  analytics,
  performance
};

// Export Firebase modules for potential direct use
export * from "firebase/auth";
export * from "firebase/firestore";
export * from "firebase/storage";