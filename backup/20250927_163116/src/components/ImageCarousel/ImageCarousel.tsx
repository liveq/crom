/**
 * ImageCarousel 컴포넌트
 * 이미지 캐러셀 - 페이드 효과, 도트 인디케이터
 */

import React, { useState, useEffect } from 'react';
import styles from './ImageCarousel.module.css';

interface CarouselImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  year?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  autoPlay = false,
  interval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [hideTimer, setHideTimer] = useState<number | null>(null);

  // 자동 재생
  useEffect(() => {
    if (!autoPlay || isHovered || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, isHovered, images.length, interval, currentIndex]);

  // 이전 이미지
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // 다음 이미지
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  // 특정 이미지로 이동
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  // 캡션 호버 처리
  const handleCaptionHover = () => {
    // 기존 타이머 클리어
    if (hideTimer) {
      clearTimeout(hideTimer);
      setHideTimer(null);
    }
    setShowCaption(true);
  };

  const handleCaptionLeave = () => {
    // 2초 후 캡션 숨기기
    const timer = setTimeout(() => {
      setShowCaption(false);
    }, 2000);
    setHideTimer(timer);
  };

  // 컴포넌트 언마운트시 타이머 정리
  useEffect(() => {
    return () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, [hideTimer]);

  // 터치 제스처 지원
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (!images || images.length === 0) return null;

  // 클릭 영역 핸들러
  const handleClickArea = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // 좌측 1/3 클릭 시 이전
    if (x < width / 3) {
      goToPrevious();
    }
    // 우측 1/3 클릭 시 다음
    else if (x > (width * 2) / 3) {
      goToNext();
    }
    // 중앙은 아무 동작 안함
  };

  // 드래그 방지
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="이미지 캐러셀"
      aria-roledescription="carousel"
    >
      {/* 이미지 영역 */}
      <div
        className={styles.imageContainer}
        onClick={handleClickArea}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
            aria-hidden={index !== currentIndex}
          >
            <picture>
              <source
                srcSet={image.url.replace(/\.(jpg|jpeg|png)$/i, '.webp')}
                type="image/webp"
              />
              <img
                src={image.url}
                alt={image.alt}
                className={styles.image}
                onDragStart={handleDragStart}
                draggable={false}
              />
            </picture>
            {image.caption && (
              <div
                className={`${styles.caption} ${showCaption ? styles.show : styles.hide}`}
                onMouseEnter={handleCaptionHover}
                onMouseLeave={handleCaptionLeave}
              >
                <p className={styles.captionText}>{image.caption}</p>
                {image.year && <span className={styles.year}>{image.year}</span>}
              </div>
            )}
          </div>
        ))}

        {/* 좌우 화살표 버튼 */}
        {images.length > 1 && (
          <>
            <button
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={goToPrevious}
              aria-label="이전 이미지"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={goToNext}
              aria-label="다음 이미지"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* 도트 인디케이터 */}
      {images.length > 1 && (
        <div className={styles.indicators}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`${index + 1}번째 이미지로 이동`}
              aria-current={index === currentIndex}
            />
          ))}
          <span className={styles.counter}>
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;