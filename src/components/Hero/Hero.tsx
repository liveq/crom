/**
 * Hero 컴포넌트
 * 메인 비주얼 섹션 - 신해철 추모 메인 이미지와 텍스트
 * 패럴랙스 효과 지원
 */

import React, { useEffect, useState } from 'react';
import styles from './Hero.module.css';
import { getImagePath } from '../../utils/assetPaths';

interface HeroProps {
  // 확장 가능한 props
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  showScrollIndicator?: boolean;
  parallax?: boolean;
  overlay?: boolean;
  className?: string;
  onScrollClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({
  backgroundImage = getImagePath('/images/hero-default.jpg'),
  title = "영원한 마왕",
  subtitle = "",
  description = "음악으로 세상을 바꾸고자 했던 아티스트를 기억합니다",
  showScrollIndicator = true,
  parallax = true,
  overlay = true,
  className,
  onScrollClick
}) => {
  // 패럴랙스 효과를 위한 스크롤 위치 상태
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // 스크롤 이벤트 리스너 등록
    window.addEventListener('scroll', handleScroll);

    // 클린업 함수
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [parallax]);

  // 스크롤 다운 핸들러
  const handleScrollDown = () => {
    if (onScrollClick) {
      onScrollClick();
    } else {
      // 기본 동작: 다음 섹션으로 부드럽게 스크롤
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  // 패럴랙스 변환 스타일
  const parallaxStyle = parallax ? {
    transform: `translateY(${scrollY * 0.5}px)`
  } : {};

  return (
    <section className={`${styles.hero} ${className || ''}`}>
      {/* 배경 이미지 레이어 */}
      {backgroundImage && (
        <div
          className={styles.backgroundLayer}
          style={{
            backgroundImage: `url(${backgroundImage})`,
            ...parallaxStyle
          }}
        />
      )}

      {/* 오버레이 레이어 (선택적) */}
      {overlay && backgroundImage && <div className={styles.overlay} />}

      {/* 콘텐츠 레이어 */}
      <div className={styles.content}>
        <div className={styles.textContainer}>
          {/* 메인 타이틀 */}
          <h1 className={`${styles.title} ${!subtitle ? styles.noSubtitle : ''}`} data-aos="fade-up">
            {title}
          </h1>

          {/* 서브타이틀 */}
          {subtitle && (
            <h2 className={styles.subtitle} data-aos="fade-up" data-aos-delay="100">
              {subtitle}
            </h2>
          )}

          {/* 설명 텍스트 */}
          {description && (
            <p className={styles.description} data-aos="fade-up" data-aos-delay="200">
              {description}
            </p>
          )}

          {/* CTA 버튼 그룹 (추후 확장용) */}
          <div className={styles.ctaGroup} data-aos="fade-up" data-aos-delay="300">
            <button
              className={styles.primaryBtn}
              onClick={() => {
                const memorialSection = document.getElementById('memorial');
                if (memorialSection) {
                  memorialSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              편지 쓰기
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => {
                const gallerySection = document.getElementById('gallery');
                if (gallerySection) {
                  gallerySection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              갤러리
            </button>
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        {showScrollIndicator && (
          <button
            className={styles.scrollIndicator}
            onClick={handleScrollDown}
            aria-label="아래로 스크롤"
          >
            <span className={styles.scrollIcon}>
              <span className={styles.scrollDot} />
            </span>
            <span className={styles.scrollText}>Scroll</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default Hero;