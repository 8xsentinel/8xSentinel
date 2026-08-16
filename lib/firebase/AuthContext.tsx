'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './config';
import { db } from '../db';
import { Profile } from '../../types';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isSuperAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}

const SUPER_ADMIN_EMAIL = '8xsentinel@gmail.com';

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isSuperAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: () => null,
  setProfile: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = Boolean(
    user?.email && user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL
  );

  const refreshProfile = useCallback(() => {
    if (user) {
      const syncedProfile = db.syncFirebaseUser(
        user.email || '',
        user.displayName || '',
        user.photoURL || ''
      );
      setProfile(syncedProfile);
      return syncedProfile;
    }
    return null;
  }, [user]);

  useEffect(() => {
    try {
      if (!auth) {
        setLoading(false);
        return;
      }
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const syncedProfile = db.syncFirebaseUser(
            firebaseUser.email || '',
            firebaseUser.displayName || '',
            firebaseUser.photoURL || ''
          );
          setProfile(syncedProfile);
        } else {
          db.setCurrentUser(null);
          setProfile(null);
        }
        setLoading(false);
      }, (error) => {
        console.warn('Firebase Auth state error:', error);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase Auth initialization caught:', e);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase Auth not initialized');
    await signInWithRedirect(auth, googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    db.setCurrentUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, isSuperAdmin, loading, signInWithGoogle, signOut, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
