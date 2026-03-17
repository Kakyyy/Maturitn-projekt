// Firebase: inicializace aplikace + export Auth/Firestore/Storage pro React Native.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, getReactNativePersistence, initializeAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from 'react-native';

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

// Auth initialization:
// - Web: standard browser auth + persistence (async)
// - Native: initializeAuth with AsyncStorage persistence
export const auth = (() => {
  if (Platform.OS === 'web') {
    const webAuth = getAuth(app);
    // Web persistence must be set asynchronously.
    setPersistence(webAuth, browserLocalPersistence).catch((e) => {
      console.error('Firebase auth persistence error (web):', e);
    });
    return webAuth;
  }

  // Lazy-require so web bundling doesn't pull RN AsyncStorage.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
})();

export const db = getFirestore(app);
export const storage = getStorage(app);