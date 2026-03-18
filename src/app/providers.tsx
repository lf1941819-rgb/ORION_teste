import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useWorkspaceStore } from '../stores/workspace.store';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setUser = useAuthStore(state => state.setUser);
  const setAuthReady = useAuthStore(state => state.setAuthReady);
  const subscribeToIdeas = useWorkspaceStore(state => state.subscribeToIdeas);

  useEffect(() => {
    let unsubscribeIdeas: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // First set basic info from Firebase Auth
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          photoUrl: firebaseUser.photoURL || undefined
        });

        // Then try to fetch extended profile from Firestore (for long photo URLs)
        try {
          const profile = await useAuthStore.getState().fetchProfile(firebaseUser.uid);
          if (profile) {
            setUser({
              id: firebaseUser.uid,
              name: profile.name || firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              photoUrl: profile.photoUrl || firebaseUser.photoURL || undefined
            });
          }
        } catch (error) {
          console.error('Auth: Failed to fetch extended profile', error);
        }

        // Subscribe to ideas after auth is ready
        unsubscribeIdeas = subscribeToIdeas() as (() => void) | undefined;
      } else {
        setUser(null);
        if (unsubscribeIdeas) {
          unsubscribeIdeas();
          unsubscribeIdeas = undefined;
        }
      }
      setAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeIdeas) unsubscribeIdeas();
    };
  }, [setUser, setAuthReady, subscribeToIdeas]);

  return <>{children}</>;
};
