'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/types';
import { fileToBase64 } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, companyName?: string, companyAddress?: string, currency?: string, plan?: 'free' | 'premium', logoFile?: File | null) => Promise<void>;
  loginWithGoogle: (plan?: 'free' | 'premium') => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger le profil Firestore
  const loadProfile = async (uid: string) => {
    const profile = await getUserProfile(uid);
    setUserProfile(profile);
  };

  // Écouter les changements d'auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await loadProfile(cred.user.uid);
  };

  const register = async (name: string, email: string, password: string, companyName?: string, companyAddress?: string, currency?: string, plan?: 'free' | 'premium', logoFile?: File | null) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    
    let logoUrl = undefined;
    if (logoFile) {
      if (logoFile.size > 500 * 1024) {
        throw new Error("L'image est trop volumineuse (max 500 KB). Compressez-la avant de l'ajouter.");
      }
      logoUrl = await fileToBase64(logoFile);
    }

    await createUserProfile(cred.user.uid, email, name, companyName, companyAddress, currency, logoUrl, plan);
    await loadProfile(cred.user.uid);
  };

  const loginWithGoogle = async (plan?: 'free' | 'premium') => {
    const cred = await signInWithPopup(auth, googleProvider);
    // Créer le profil s'il n'existe pas
    const existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      await createUserProfile(
        cred.user.uid,
        cred.user.email || '',
        cred.user.displayName || 'Utilisateur',
        undefined,
        undefined,
        undefined,
        plan
      );
    }
    await loadProfile(cred.user.uid);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.uid);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
