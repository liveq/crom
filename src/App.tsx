/**
 * 신해철 추모 사이트 메인 애플리케이션
 * 라우터 설정
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage';
import AdminPanel from './components/AdminPanel/AdminPanel';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 페이지 로드/새로고침 시 무조건 최상단으로 (즉시 실행)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 즉시 스크롤, smooth 애니메이션 없음
    });

    // 추가 보장: 다른 모든 스크롤 이벤트보다 우선하도록 강제 실행
    const forceScrollTop = () => {
      if (window.scrollY !== 0) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    };

    // 컴포넌트 마운트 직후와 DOM 준비 후 추가 실행
    const timeouts = [
      setTimeout(forceScrollTop, 0),
      setTimeout(forceScrollTop, 10),
      setTimeout(forceScrollTop, 50)
    ];

    // 해시가 있고 새로고침이 아닌 경우에만 섹션으로 이동
    if (hash && !window.performance.navigation?.type) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element && window.scrollY === 0) { // 스크롤이 상단에 있을 때만
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200); // 딜레이를 늘려 다른 스크롤 이벤트가 완료된 후 실행
    }

    // 클린업
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [pathname, hash]);

  return null;
}

function App() {
  useEffect(() => {
    // 브라우저의 자동 스크롤 복원 기능 비활성화
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;// Force rebuild at #오후
