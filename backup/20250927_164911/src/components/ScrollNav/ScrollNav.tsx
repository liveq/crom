/**
 * ScrollNav 컴포넌트
 * 우측 고정 네비게이션 - 스마트 표시/숨김
 * 스크롤 중 표시, 2초 후 숨김, 마우스 근처 호버시 표시
 */

import React, { useState, useEffect, useRef } from 'react';
import styles from './ScrollNav.module.css';

const ScrollNav: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
      // 스크롤 중에는 표시
      setIsVisible(true);

      // 이전 타임아웃 취소
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 스크롤 끝나고 2초 후 숨김 (호버 중이 아닐 때만)
      scrollTimeoutRef.current = setTimeout(() => {
        if (!isHovered) {
          setIsVisible(false);
        }
      }, 2000);
    };

    // 마우스 무브 이벤트 핸들러 - 우측 영역 감지
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 150; // 우측에서 150px 이내
      const isNearRight = window.innerWidth - e.clientX < threshold;

      if (isNearRight) {
        setIsVisible(true);
        // 마우스가 영역 밖으로 나가면 2초 후 숨김
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      } else if (!isHovered) {
        // 마우스가 영역 밖이고 호버 중이 아니면 2초 후 숨김
        if (!hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            if (!isHovered) {
              setIsVisible(false);
            }
          }, 2000);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isHovered]);

  // 네비게이션에 직접 호버
  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // 마우스가 떠나고 2초 후 숨김
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  };

  // 위로 스크롤
  const scrollUp = () => {
    const currentPosition = window.scrollY;
    if (currentPosition <= 100) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
    }
  };

  // 아래로 스크롤
  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  };

  return (
    <nav
      className={`${styles.scrollNav} ${isVisible ? styles.visible : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={styles.navButton}
        onClick={scrollUp}
        aria-label="위로 스크롤"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 4L12 9H4L8 4Z" fill="currentColor"/>
        </svg>
      </button>
      <div className={styles.divider} />
      <button
        className={styles.navButton}
        onClick={scrollDown}
        aria-label="아래로 스크롤"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 12L4 7H12L8 12Z" fill="currentColor"/>
        </svg>
      </button>
    </nav>
  );
};

export default ScrollNav;