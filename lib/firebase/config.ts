import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver, 
  inMemoryPersistence, 
  getAuth, 
  Auth 
} from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
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

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;
  const app = getFirebaseApp();
  try {
    authInstance = initializeAuth(app, {
      persistence: typeof window !== 'undefined' ? browserLocalPersistence : inMemoryPersistence,
      popupRedirectResolver: typeof window !== 'undefined' ? browserPopupRedirectResolver : undefined
    });
  } catch {
    authInstance = getAuth(app);
  }
  return authInstance;
}

export const app: FirebaseApp = getFirebaseApp();
export const auth: Auth = getFirebaseAuth();
export const storage: FirebaseStorage = getStorage(app);

let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        console.warn('Firebase Analytics initialization error:', err);
      }
    }
  }).catch(() => {});
}

export { analytics, firebaseConfig };
