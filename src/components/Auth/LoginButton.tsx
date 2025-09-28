/**
 * 로그인 버튼 컴포넌트
 * 구글 로그인 및 익명 로그인
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginButton.module.css';

const LoginButton: React.FC = () => {
  const { user, signInWithGoogle, signInAnonymous, logout, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setShowMenu(false);
    } catch (error) {
      alert('로그인에 실패했습니다.');
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymous();
      setShowMenu(false);
    } catch (error) {
      alert('익명 로그인에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowMenu(false);
    } catch (error) {
      alert('로그아웃에 실패했습니다.');
    }
  };

  if (user) {
    return (
      <div className={styles.userMenu}>
        <button
          className={styles.userButton}
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className={styles.userAvatar}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="프로필" />
            ) : (
              <span>{user.isAnonymous ? '익' : user.email?.[0] || '?'}</span>
            )}
          </span>
          <span className={styles.userName}>
            {user.isAnonymous ? '익명 사용자' : user.displayName || user.email}
            {isAdmin && ' (관리자)'}
          </span>
        </button>

        {showMenu && (
          <div className={styles.dropdown}>
            {isAdmin && (
              <a href="/admin" className={styles.dropdownItem}>
                관리자 패널
              </a>
            )}
            <button onClick={handleLogout} className={styles.dropdownItem}>
              로그아웃
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.loginButtons}>
      <button
        onClick={handleGoogleLogin}
        className={`${styles.loginButton} ${styles.google}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        구글로 로그인
      </button>

      <button
        onClick={handleAnonymousLogin}
        className={`${styles.loginButton} ${styles.anonymous}`}
      >
        익명으로 참여
      </button>
    </div>
  );
};

export default LoginButton;