/**
 * MediaGallery 컴포넌트
 * 사진, 음악, 영상을 탭 형태로 보여주는 갤러리
 * 라이트박스 및 미디어 플레이어 지원
 */

import React, { useState, useCallback, useEffect } from 'react';
import styles from './MediaGallery.module.css';
import type { MediaItem } from '../../types';
import { getImagePath } from '../../utils/assetPaths';

interface MediaGalleryProps {
  photos?: MediaItem[];
  music?: MediaItem[];
  videos?: MediaItem[];
  initialTab?: 'photos' | 'music' | 'videos';
  columns?: number;
  className?: string;
  onItemClick?: (item: MediaItem) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  photos = [],
  music = [],
  videos = [],
  initialTab = 'photos',
  columns = 3,
  className,
  onItemClick
}) => {
  // 현재 활성 탭 상태
  const [activeTab, setActiveTab] = useState<'photos' | 'music' | 'videos'>(initialTab);

  // 선택된 미디어 아이템 (라이트박스용)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // 터치 이벤트를 위한 상태
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // 반응형 아이템 수 설정
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsPerPage(1);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 현재 탭의 미디어 아이템 가져오기
  const getCurrentItems = useCallback(() => {
    switch (activeTab) {
      case 'photos':
        return photos;
      case 'music':
        return music;
      case 'videos':
        return videos;
      default:
        return [];
    }
  }, [activeTab, photos, music, videos]);

  // 미디어 아이템 클릭 핸들러
  const handleItemClick = (item: MediaItem, index: number) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      // 기본 동작: 라이트박스 열기
      setSelectedItem(item);
      setSelectedIndex(index);
    }
  };

  // 라이트박스 닫기
  const closeLightbox = () => {
    setSelectedItem(null);
    setSelectedIndex(-1);
  };

  // 이전/다음 네비게이션 (루프 기능 추가)
  const navigatePrevious = useCallback(() => {
    const items = getCurrentItems();
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setSelectedItem(items[selectedIndex - 1]);
    } else {
      // 첫 번째에서 이전 누르면 마지막으로
      setSelectedIndex(items.length - 1);
      setSelectedItem(items[items.length - 1]);
    }
  }, [selectedIndex, getCurrentItems]);

  const navigateNext = useCallback(() => {
    const items = getCurrentItems();
    if (selectedIndex < items.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setSelectedItem(items[selectedIndex + 1]);
    } else {
      // 마지막에서 다음 누르면 첫 번째로
      setSelectedIndex(0);
      setSelectedItem(items[0]);
    }
  }, [selectedIndex, getCurrentItems]);

  // ESC 키로 라이트박스 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItem) {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && selectedItem) {
        navigatePrevious();
      } else if (e.key === 'ArrowRight' && selectedItem) {
        navigateNext();
      }
    };

    if (selectedItem) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedItem, closeLightbox, navigatePrevious, navigateNext]);

  // 터치 이벤트 핸들러
  const minSwipeDistance = 50; // 최소 스와이프 거리

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateNext();
    } else if (isRightSwipe) {
      navigatePrevious();
    }
  };

  // 미디어 아이템 렌더링
  const renderMediaItem = (item: MediaItem, index: number) => {
    switch (item.type) {
      case 'photo':
        return (
          <div
            key={item.id}
            className={styles.photoItem}
            onClick={() => handleItemClick(item, index)}
          >
            <picture>
              <source
                srcSet={
                  item.thumbnailUrl
                    ? item.thumbnailUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp')
                    : getImagePath(`/images/thumbnails/${item.url.split('/').pop()?.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`)
                }
                type="image/webp"
              />
              <img
                src={
                  item.thumbnailUrl ||
                  getImagePath(`/images/thumbnails/${item.url.split('/').pop()?.replace(/\.(jpg|jpeg|png)$/i, '.jpg')}`)
                }
                alt={item.title}
                loading="lazy"
                className={styles.thumbnail}
              />
            </picture>
            <div className={styles.itemOverlay}>
              <h4 className={styles.itemTitle}>{item.title}</h4>
              {item.date && <span className={styles.itemDate}>{item.date}</span>}
            </div>
          </div>
        );

      case 'music':
        return (
          <div
            key={item.id}
            className={styles.musicItem}
            onClick={() => handleItemClick(item, index)}
          >
            <div className={styles.musicThumbnail}>
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt={item.title} />
              ) : (
                <div className={styles.musicIcon}>♪</div>
              )}
            </div>
            <div className={styles.musicInfo}>
              <h4 className={styles.musicTitle}>{item.title}</h4>
              {item.description && (
                <p className={styles.musicDescription}>{item.description}</p>
              )}
            </div>
            <button className={styles.playButton} aria-label="재생">
              ▶
            </button>
          </div>
        );

      case 'video':
        return (
          <div
            key={item.id}
            className={styles.videoItem}
            onClick={() => handleItemClick(item, index)}
          >
            <div className={styles.videoThumbnail}>
              <img
                src={item.thumbnailUrl || getImagePath('/images/video-placeholder.jpg')}
                alt={item.title}
                loading="lazy"
              />
              <div className={styles.playOverlay}>
                <span className={styles.playIcon}>▶</span>
              </div>
            </div>
            <h4 className={styles.videoTitle}>{item.title}</h4>
            {item.description && (
              <p className={styles.videoDescription}>{item.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const currentItems = getCurrentItems();

  // 페이지네이션 계산
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const paginatedItems = currentItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // 탭 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

  // 페이지 네비게이션
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <section className={`${styles.gallery} ${className || ''}`}>
      <div className={styles.container}>
        {/* 섹션 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>갤러리</h2>
          <p className={styles.sectionDescription}>
            신해철의 음악과 순간들을 기억합니다
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'photos' ? styles.active : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            사진 ({photos.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'music' ? styles.active : ''}`}
            onClick={() => setActiveTab('music')}
          >
            음악 ({music.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'videos' ? styles.active : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            영상 ({videos.length})
          </button>
        </div>

        {/* 갤러리 그리드 - 페이지네이션 적용 */}
        <div className={styles.galleryWrapper}>
          {/* 좌측 화살표 */}
          {totalPages > 1 && (
            <button
              className={`${styles.arrowButton} ${styles.prevArrow}`}
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              aria-label="이전 페이지"
            >
              ‹
            </button>
          )}

          {/* 그리드 */}
          <div className={styles.grid}>
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item, index) =>
                renderMediaItem(item, currentPage * itemsPerPage + index)
              )
            ) : (
              <div className={styles.emptyState}>
                <p>아직 등록된 콘텐츠가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 우측 화살표 */}
          {totalPages > 1 && (
            <button
              className={`${styles.arrowButton} ${styles.nextArrow}`}
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              aria-label="다음 페이지"
            >
              ›
            </button>
          )}
        </div>

        {/* 음악 탭 재생 안내 */}
        {activeTab === 'music' && music.length > 0 && (
          <div className={styles.musicNotice}>
            <p>※ 테스트 페이지로 실제 재생은 지원되지 않습니다</p>
          </div>
        )}

        {/* 페이지네이션 인디케이터 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {(() => {
              const isMobile = window.innerWidth <= 768;
              const maxVisible = isMobile ? 5 : 10;
              let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
              const endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

              if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(0, endPage - maxVisible + 1);
              }

              const pages = [];

              // 데스크톱: 첫 페이지 버튼 (가장 왼쪽)
              if (!isMobile && currentPage > 0) {
                pages.push(
                  <button
                    key="first"
                    className={styles.pageButton}
                    onClick={() => setCurrentPage(0)}
                    aria-label="첫 페이지"
                  >
                    «
                  </button>
                );
              }

              // 모바일: 5페이지 이전 버튼 (바깥쪽) - 항상 표시
              if (isMobile) {
                pages.push(
                  <button
                    key="jump-prev"
                    className={styles.pageButton}
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 5))}
                    disabled={currentPage === 0}
                    aria-label="5페이지 이전"
                  >
                    ««
                  </button>
                );
              }

              // 이전 버튼
              pages.push(
                <button
                  key="prev"
                  className={styles.pageButton}
                  onClick={goToPrevPage}
                  disabled={currentPage === 0}
                  aria-label="이전"
                >
                  ‹
                </button>
              );

              // 페이지 번호들
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
                    onClick={() => setCurrentPage(i)}
                    aria-label={`페이지 ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              }

              // 다음 버튼
              pages.push(
                <button
                  key="next"
                  className={styles.pageButton}
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  aria-label="다음"
                >
                  ›
                </button>
              );

              // 모바일: 5페이지 다음 버튼 (바깥쪽) - 항상 표시
              if (isMobile) {
                pages.push(
                  <button
                    key="jump-next"
                    className={styles.pageButton}
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 5))}
                    disabled={currentPage === totalPages - 1}
                    aria-label="5페이지 다음"
                  >
                    »»
                  </button>
                );
              }

              // 데스크톱: 마지막 페이지 버튼 (가장 오른쪽)
              if (!isMobile && currentPage < totalPages - 1) {
                pages.push(
                  <button
                    key="last"
                    className={styles.pageButton}
                    onClick={() => setCurrentPage(totalPages - 1)}
                    aria-label="마지막 페이지"
                  >
                    »
                  </button>
                );
              }

              return pages;
            })()}
          </div>
        )}
      </div>

      {/* 라이트박스 (선택된 아이템이 있을 때) */}
      {selectedItem && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.closeButton} aria-label="닫기">
            ×
          </button>

          {/* 이전 버튼 (항상 표시) */}
          <button
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={(e) => {
              e.stopPropagation();
              navigatePrevious();
            }}
            aria-label="이전"
          >
            ‹
          </button>

          {/* 다음 버튼 (항상 표시) */}
          <button
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={(e) => {
              e.stopPropagation();
              navigateNext();
            }}
            aria-label="다음"
          >
            ›
          </button>

          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {selectedItem.type === 'photo' && (
              <div className={styles.imageWrapper}>
                <img src={selectedItem.url} alt={selectedItem.title} />
                {/* 좌우 클릭 영역 */}
                <div
                  className={styles.clickAreaLeft}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePrevious();
                  }}
                  aria-label="이전 사진"
                />
                <div
                  className={styles.clickAreaRight}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateNext();
                  }}
                  aria-label="다음 사진"
                />
              </div>
            )}
            {selectedItem.type === 'music' && (
              <audio controls src={selectedItem.url} autoPlay />
            )}
            {selectedItem.type === 'video' && (
              <video controls src={selectedItem.url} autoPlay />
            )}
            <div className={styles.lightboxInfo}>
              <h3>{selectedItem.title}</h3>
              {selectedItem.description && <p>{selectedItem.description}</p>}
              <p className={styles.lightboxCounter}>
                {selectedIndex + 1} / {getCurrentItems().length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaGallery;