/**
 * Firebase 설정 및 초기화
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 설정 디버깅
console.log('🔧 Firebase 설정 확인:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  projectId: firebaseConfig.projectId, // 실제 프로젝트 ID 표시
  configComplete: Object.values(firebaseConfig).every(v => v)
});

// Firebase 앱 초기화
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase 초기화 성공');
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  throw error;
}

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 인증 프로바이더
export const googleProvider = new GoogleAuthProvider();

// 관리자 이메일 목록
export const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];

// Firebase 연결 테스트 함수
export const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Firebase 연결 테스트 시작...');

    // Firestore 연결 테스트
    const { enableNetwork, disableNetwork, terminate } = await import('firebase/firestore');
    await enableNetwork(db);
    console.log('✅ Firestore 연결 성공');

    return { success: true, error: null };
  } catch (error: any) {
    console.error('❌ Firebase 연결 테스트 실패:', {
      message: error.message,
      code: error.code,
      details: error
    });
    return { success: false, error };
  }
};

// 브라우저 전역에 테스트 함수 노출
if (typeof window !== 'undefined') {
  (window as any).testFirebaseConnection = testFirebaseConnection;
}

export default app;