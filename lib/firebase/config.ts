import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB4pqPHPqmRf8NkZ_vjbWVqBd6MVCpXiMA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "eightxsentinel.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "eightxsentinel",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "eightxsentinel.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "294642901258",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:294642901258:web:ba664040f6230f6c579af3",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GKLTGYN1LG"
};

// Initialize Firebase safely for SSR & client environments
let app: FirebaseApp;
let auth: Auth;
let analytics: Analytics | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization error, attempting fallback:', error);
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig, 'fallback');
  auth = getAuth(app);
}

// Initialize Firebase Analytics in client environment only
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        console.warn('Firebase Analytics initialization error:', err);
      }
    }
  }).catch(() => {
    // Ignore analytics if not supported in environment
  });
}

export { app, auth, analytics, firebaseConfig };
