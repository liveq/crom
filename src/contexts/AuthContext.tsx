/**
 * 인증 컨텍스트
 * Firebase Auth 상태 관리
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAILS } from '../config/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAnonymous: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signInAnonymous: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user?.email ? ADMIN_EMAILS.includes(user.email) : false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google 로그인 성공:', result.user.email);
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      throw error;
    }
  };

  const signInAnonymous = async () => {
    try {
      const result = await signInAnonymously(auth);
      console.log('익명 로그인 성공:', result.user.uid);
    } catch (error) {
      console.error('익명 로그인 실패:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    signInWithGoogle,
    signInAnonymous,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};