import { create } from 'zustand';
import { User } from '../features/auth/types/auth.types';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { signInWithRedirect, GoogleAuthProvider, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  updateUser: (data: { name?: string; photoUrl?: string }) => Promise<void>;
  fetchProfile: (userId: string) => Promise<Partial<User> | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAuthReady: false,
  login: async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Auth: Login failed', error);
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Auth: Logout failed', error);
    }
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  updateUser: async (data) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // 1. Update Firebase Auth Profile
      // Firebase Auth has a limit on photoURL length (~2048 chars).
      // If the URL is too long, we skip updating the Auth profile and only use Firestore.
      const isPhotoUrlTooLong = data.photoUrl && data.photoUrl.length > 2000;
      
      try {
        await updateProfile(currentUser, {
          displayName: data.name || currentUser.displayName,
          photoURL: isPhotoUrlTooLong ? currentUser.photoURL : (data.photoUrl || currentUser.photoURL),
        });
      } catch (authError: any) {
        // If it's specifically a length error, we ignore it and rely on Firestore
        if (authError.code === 'auth/invalid-profile-attribute' || authError.message?.includes('too long')) {
          console.warn('Auth: Photo URL too long for Firebase Auth, using Firestore as primary storage.');
          // Still try to update displayName if it's provided
          if (data.name) {
            await updateProfile(currentUser, { displayName: data.name });
          }
        } else {
          throw authError;
        }
      }

      // 2. Update Firestore Profile (Primary storage for long URLs)
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        id: currentUser.uid,
        name: data.name || currentUser.displayName || 'User',
        email: currentUser.email || '',
        photoUrl: data.photoUrl || currentUser.photoURL || '',
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // 3. Update local state
      const updatedUser = get().user;
      if (updatedUser) {
        set({
          user: {
            ...updatedUser,
            name: data.name || updatedUser.name,
            photoUrl: data.photoUrl || updatedUser.photoUrl,
          },
        });
      }
    } catch (error) {
      console.error('Auth: Update profile failed', error);
      throw error;
    }
  },
  fetchProfile: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as Partial<User>;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      return null;
    }
  }
}));
