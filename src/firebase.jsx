// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDb3O_95tN52wH6YDbueI8pj21y-7R49Lg",
  authDomain: "alignify-d100d.firebaseapp.com",
  projectId: "alignify-d100d",
  storageBucket: "alignify-d100d.firebasestorage.app",
  messagingSenderId: "266537613273",
  appId: "1:266537613273:web:aad966fc08863bf14ecbc8",
  measurementId: "G-ZS1DFM8V3B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }