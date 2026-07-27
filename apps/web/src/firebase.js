import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// This reads the hidden variables from your .env.local file
const firebaseConfig = {
  apiKey: "AIzaSyDASqUUjTo0wl4jaxf4xk3Z1exuYnbqYhk",
  authDomain: "selltronics-74f3a.firebaseapp.com",
  databaseURL: "https://selltronics-74f3a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "selltronics-74f3a",
  storageBucket: "selltronics-74f3a.firebasestorage.app",
  messagingSenderId: "552424549072",
  appId: "1:552424549072:web:f852e1d0010c1594ae0cd5"
};
// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };