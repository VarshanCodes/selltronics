import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// (You will add the actual values to your .env.local file later)
const firebaseConfig = {
  apiKey: "AIzaSyDASqUUjTo0wl4jaxf4xk3Z1exuYnbqYhk",
  authDomain: "selltronics-74f3a.firebaseapp.com",
  databaseURL: "https://selltronics-74f3a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "selltronics-74f3a",
  storageBucket: "selltronics-74f3a.firebasestorage.app",
  messagingSenderId: "552424549072",
  appId: "1:552424549072:web:f852e1d0010c1594ae0cd5"
};

// Initialize Firebase (prevents re-initialization in Next.js hot reloads)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (your database)
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
