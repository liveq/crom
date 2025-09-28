import React, { useState } from 'react';
import { auth, googleProvider } from '../../config/firebase';
import { signInWithPopup, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import './LoginModal.css';

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError('Google 로그인 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInAnonymously(auth);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError('익명 로그인 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <h2>{isSignUp ? '회원가입' : '로그인'}</h2>

        <div className="social-login-section">
          <button
            className="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" />
            Google로 {isSignUp ? '가입' : '로그인'}
          </button>

          <button
            className="anonymous-login-btn"
            onClick={handleAnonymousLogin}
            disabled={loading}
          >
            익명으로 추모 메시지 남기기
          </button>
        </div>

        <div className="divider">
          <span>또는</span>
        </div>

        <form onSubmit={handleEmailAuth} className="email-login-form">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? '처리중...' : (isSignUp ? '가입하기' : '로그인')}
          </button>
        </form>

        <p className="toggle-auth">
          {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? '로그인' : '회원가입'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;