'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { getFirebaseAuth } from './config';
import { db } from '../db';
import { Profile } from '../../types';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isSuperAdmin: boolean;
  isRegionalAdmin: boolean;
  isReseller: boolean;
  loading: boolean;
  isAuthenticating: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}

const SUPER_ADMIN_EMAIL = '8xsentinel@gmail.com';

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isSuperAdmin: false,
  isRegionalAdmin: false,
  isReseller: false,
  loading: true,
  isAuthenticating: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => null,
  setProfile: () => {},
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const isAuthenticatingRef = useRef<boolean>(false);

  const isSuperAdmin = Boolean(
    (user?.email && user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL) ||
    profile?.role === 'super_admin'
  );

  const isRegionalAdmin = Boolean(
    profile?.role === 'regional_admin' || profile?.roles?.includes('regional_admin')
  );

  const isReseller = Boolean(
    profile?.role === 'verified_reseller' || profile?.store_status === 'approved'
  );

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (user && user.email) {
      try {
        const synced = await db.syncFirebaseUser(
          user.email,
          user.displayName || '',
          user.photoURL || ''
        );
        setProfile(synced);
        return synced;
      } catch (err) {
        console.error('Error refreshing profile:', err);
      }
    }
    return null;
  }, [user]);

  // Single authoritative auth listener
  useEffect(() => {
    let isMounted = true;
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      setUser(firebaseUser);

      if (firebaseUser && firebaseUser.email) {
        try {
          const synced = await db.syncFirebaseUser(
            firebaseUser.email,
            firebaseUser.displayName || '',
            firebaseUser.photoURL || ''
          );
          if (isMounted) {
            setProfile(synced);
          }
        } catch (e) {
          console.error('Failed to sync profile on auth state change:', e);
        }
      } else {
        if (isMounted) {
          setProfile(null);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }, (error) => {
      console.warn('Firebase Auth state error:', error);
      if (isMounted) {
        setLoading(false);
      }
    });

    // Listen for tab focus/visibility change to keep clearance status in sync
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && auth.currentUser?.email) {
        db.syncFirebaseUser(
          auth.currentUser.email,
          auth.currentUser.displayName || '',
          auth.currentUser.photoURL || ''
        ).then((synced) => {
          if (isMounted) setProfile(synced);
        }).catch(() => {});
      }
    };

    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribe();
    };
  }, []);

  // Canonical Google Sign-In with concurrency lock
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    if (isAuthenticatingRef.current) {
      console.warn('Google sign-in is already in progress. Ignoring duplicate trigger.');
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }

    isAuthenticatingRef.current = true;
    setIsAuthenticating(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    } catch (popupError: unknown) {
      const error = popupError as { code?: string; message?: string };
      console.warn('Firebase popup sign-in caught:', error);

      // Normal user cancellation - do not treat as error
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      throw popupError;
    } finally {
      isAuthenticatingRef.current = false;
      setIsAuthenticating(false);
    }
  }, []);

  // Canonical Sign Out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isSuperAdmin,
      isRegionalAdmin,
      isReseller,
      loading,
      isAuthenticating,
      signInWithGoogle,
      signOut,
      refreshProfile,
      setProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
