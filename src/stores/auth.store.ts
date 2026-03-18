import { create } from 'zustand';
import { User, Session } from '../features/auth/types/auth.types';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthReady: false,
  login: async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
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
}));
