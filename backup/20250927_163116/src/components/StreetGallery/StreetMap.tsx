import React, { useState } from 'react';
import styles from './StreetMap.module.css';

interface MapArea {
  id: string;
  name: string;
  className: string;
  modalId: string | null;
  href?: string;
  images?: {
    day: string[];
    night: string[];
  };
}

const StreetMap: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<MapArea | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'night'>('day');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const areas: MapArea[] = [
    {
      id: 'area1',
      name: '진입마당(정면) 구간',
      className: 'btn_area1',
      modalId: 'modal-area1',
      images: {
        day: Array.from({ length: 10 }, (_, i) =>
          `https://cromst.seongnam.go.kr:10005/images/content/street_view/area1_day${i + 1}.jpg`
        ),
        night: Array.from({ length: 8 }, (_, i) =>
          `https://cromst.seongnam.go.kr:10005/images/content/street_view/area1_night${i + 1}.jpg`
        )
      }
    },
    {
      id: 'workplace',
      name: '신해철 작업실',
      className: 'btn_area2',
      modalId: null,
      href: 'https://cromst.seongnam.go.kr:10005/street/workplace'
    },
    {
      id: 'area2',
      name: '신해철 작업실 구간',
      className: 'btn_area3',
      modalId: 'modal-area2',
      images: {
        day: Array.from({ length: 14 }, (_, i) =>
          `https://cromst.seongnam.go.kr:10005/images/content/street_view/area2_day${i + 1}.jpg`
        ),
        night: Array.from({ length: 10 }, (_, i) =>
          `https://cromst.seongnam.go.kr:10005/images/content/street_view/area2_night${i + 1}.jpg`
        )
      }
    },
    {
      id: 'area3',
      name: '추모마당 구간',
      className: 'btn_area4',
      modalId: 'modal-area3',
      images: {
        day: Array.from({ length: 10 }, (_, i) =>
          `https://cromst.seongnam.go.kr:10005/images/content/street_view/area3_day${i + 1}.jpg`
        ),
        night: Array.from({ length: 10 }, (_, i) =>
          `https://cromst.seongnam.go.kr:10005/images/content/street_view/area3_night${i + 1}.jpg`
        )
      }
    },
    {
      id: 'area4',
      name: '진입마당(후면) 구간',
      className: 'btn_area5',
      modalId: 'modal-area4',
      images: {
        day: Array.from({ length: 13 }, (_, i) =>
          `https://cromst.seongnam.go.kr:10005/images/content/street_view/area4_day${i + 1}.jpg`
        ),
        night: Array.from({ length: 7 }, (_, i) =>
          `https://cromst.seongnam.go.kr:10005/images/content/street_view/area4_night${i + 1}.jpg`
        )
      }
    }
  ];

  const handleAreaClick = (area: MapArea) => {
    if (area.id === 'workplace') {
      // 작업실은 부모 컴포넌트의 탭 전환 함수 호출
      const event = new CustomEvent('changeTab', { detail: 'workplace' });
      window.dispatchEvent(event);
    } else if (area.images) {
      setSelectedArea(area);
      setCurrentImageIndex(0);
    }
  };

  const handleCloseModal = () => {
    setSelectedArea(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedArea && selectedArea.images) {
      const images = selectedArea.images[viewMode];
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedArea && selectedArea.images) {
      const images = selectedArea.images[viewMode];
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'day' ? 'night' : 'day');
    setCurrentImageIndex(0);
  };

  return (
    <>
      <div className={styles.mapSection}>
        {/* 상단 지도 영역 - 스크롤 가능 */}
        <div className={styles.mapContainer}>
          <div className={styles.mapInner}>
            <div className={styles.map}>
              <div className={styles.location}>
              <span className={styles.btn_area1} onClick={() => handleAreaClick(areas[0])}>
                <a href="#area1" onClick={(e) => e.preventDefault()}>
                  진입마당(정면) 구간<i></i>
                </a>
              </span>
              <span className={styles.btn_area2} onClick={() => handleAreaClick(areas[1])}>
                <a href="#workplace" onClick={(e) => e.preventDefault()}>
                  신해철 작업실<i></i>
                </a>
              </span>
              <span className={styles.btn_area3} onClick={() => handleAreaClick(areas[2])}>
                <a href="#area2" onClick={(e) => e.preventDefault()}>
                  신해철 작업실 구간<br />
                  (2023.12.28.까지 운영)<i></i>
                </a>
              </span>
              <span className={styles.btn_area4} onClick={() => handleAreaClick(areas[3])}>
                <a href="#area3" onClick={(e) => e.preventDefault()}>
                  추모마당 구간<i></i>
                </a>
              </span>
              <span className={styles.btn_area5} onClick={() => handleAreaClick(areas[4])}>
                <a href="#area4" onClick={(e) => e.preventDefault()}>
                  진입마당(후면) 구간<i></i>
                </a>
              </span>
            </div>
          </div>
          </div>
        </div>

        {/* 하단 범례 - 고정 */}
        <div className={styles.legend}>
          <ul>
            <li><i className={styles.icon1}></i><span>상징게이트</span></li>
            <li><i className={styles.icon2}></i><span>추모블럭</span></li>
            <li><i className={styles.icon3}></i><span>음표블럭</span></li>
            <li><i className={styles.icon4}></i><span>분전함</span></li>
            <li><i className={styles.icon5}></i><span>신해철동상</span></li>
            <li><i className={styles.icon6}></i><span>주모가벽</span></li>
          </ul>
        </div>
      </div>

      {/* Modal */}
      {selectedArea && selectedArea.images && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedArea.name}</h2>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                <img src="/street-assets/btn_close.png" alt="닫기" />
              </button>
            </div>

            <div className={styles.modalTabs}>
              <button
                className={`${styles.tabButton} ${styles.tab1} ${viewMode === 'day' ? styles.active : ''}`}
                onClick={() => setViewMode('day')}
                title="주간"
              >
                <img src="/street-assets/btn_menu1.png" alt="주간" />
              </button>
              <button
                className={`${styles.tabButton} ${styles.tab2} ${viewMode === 'night' ? styles.active : ''}`}
                onClick={() => setViewMode('night')}
                title="야간"
              >
                <img src="/street-assets/btn_menu2.png" alt="야간" />
              </button>
              <button
                className={`${styles.tabButton} ${styles.tab3}`}
                title="파노라마"
              >
                <img src="/street-assets/btn_menu3.png" alt="파노라마" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <button className={`${styles.navButton} ${styles.bxPrev}`} onClick={handlePrevImage}>
                <img src="/street-assets/btn_prev.png" alt="이전" />
              </button>

              <div className={styles.imageContainer}>
                <img
                  src={selectedArea.images[viewMode][currentImageIndex]}
                  alt={`${selectedArea.name} ${viewMode === 'day' ? '낮' : '밤'}풍경 ${currentImageIndex + 1}`}
                  className={styles.modalImage}
                />
              </div>

              <button className={`${styles.navButton} ${styles.bxNext}`} onClick={handleNextImage}>
                <img src="/street-assets/btn_next.png" alt="다음" />
              </button>
            </div>

            <div className={styles.imageCounter}>
              <span className={styles.current}>{currentImageIndex + 1}</span> / {selectedArea.images[viewMode].length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StreetMap;