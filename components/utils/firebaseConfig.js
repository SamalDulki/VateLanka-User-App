import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let app = null;

const initializeFirebase = async () => {
  if (!app) {
    try {
      const response = await fetch('https://vatelanka-backend.vercel.app/api/config/firebase');
      const config = await response.json();
      app = initializeApp(config);
      return app;
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      throw error;
    }
  }
  return app;
};

export const getFirebaseAuth = async () => {
  const app = await initializeFirebase();
  return getAuth(app);
};

export const getFirebaseFirestore = async () => {
  const app = await initializeFirebase();
  return getFirestore(app);
};

initializeFirebase();

export { app };