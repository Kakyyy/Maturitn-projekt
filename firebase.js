// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4dilrTAvxCeTPm7qFL0i_XOeMyVBOM3g",
  authDomain: "database-28d92.firebaseapp.com",
  projectId: "database-28d92",
  storageBucket: "database-28d92.firebasestorage.app",
  messagingSenderId: "615229955958",
  appId: "1:615229955958:web:3f7f3ca7d1da929744a457",
  measurementId: "G-MFRQRFSQK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);