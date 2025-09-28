/**
 * TopButton 컴포넌트
 * 우측 ScrollNav 위 고정 TOP 버튼
 * 스크롤 시 나타나고 2초 후 자동 숨김
 */

import React, { useState, useEffect, useRef } from 'react';
import styles from './TopButton.module.css';

const TopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const scrolled = window.scrollY > 300;

      // 300px 이상 스크롤했는지 확인
      setIsVisible(scrolled);

      // 스크롤 시 버튼 표시 (100ms 간격으로)
      if (scrolled && now - lastScrollTime.current > 100) {
        lastScrollTime.current = now;
        setShowButton(true);

        // 이전 타이머 취소
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
        }

        // 2초 후 숨김
        hideTimer.current = window.setTimeout(() => {
          setShowButton(false);
        }, 2000);
      }

      // 상단 근처에서는 버튼 숨김
      if (!scrolled) {
        setShowButton(false);
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 상태 설정

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  // 마우스 움직임 감지
  const handleMouseMove = () => {
    if (!isVisible) return;

    setShowButton(true);

    // 이전 타이머 취소
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }

    // 2초 후 숨김
    hideTimer.current = window.setTimeout(() => {
      setShowButton(false);
    }, 2000);
  };

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`${styles.topButton} ${showButton && isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      onMouseEnter={handleMouseMove}
      aria-label="맨 위로"
      title="맨 위로"
    >
      <span className={styles.text}>TOP</span>
    </button>
  );
};

export default TopButton;