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
  const [showWorkplace, setShowWorkplace] = useState(false);
  const [workplaceTab, setWorkplaceTab] = useState<'main' | 'library'>('main');

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
      // 작업실 전용 모달 표시
      setShowWorkplace(true);
      setWorkplaceTab('main');
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
            <div className={styles.map} onDragStart={(e) => e.preventDefault()}>
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
              <span className={styles.btn_area5} onClick={() => handleAreaClick({ id: 'workplace', name: '작업실', className: 'btn_area5', modalId: 'modal-workplace' })}>
                <a href="#workplace" onClick={(e) => e.preventDefault()}>
                  작업실<i></i>
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

      {/* Workplace Modal */}
      {showWorkplace && (
        <div className={styles.workplaceModal} onClick={() => setShowWorkplace(false)}>
          <div className={styles.workplaceContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.workplaceHeader}>
              <h2>작업실</h2>
              <button className={styles.closeButton} onClick={() => setShowWorkplace(false)}>
                <img src="/street-assets/btn_close.png" alt="닫기" />
              </button>
            </div>

            <div className={styles.workplaceTabs}>
              <button
                className={workplaceTab === 'main' ? styles.active : ''}
                onClick={() => setWorkplaceTab('main')}
              >
                음악작업실
              </button>
              <button
                className={workplaceTab === 'library' ? styles.active : ''}
                onClick={() => setWorkplaceTab('library')}
              >
                서재 & 레코드실
              </button>
            </div>

            <div className={styles.workplaceBody}>
              {workplaceTab === 'main' ? (
                <div className={styles.workplaceMain}>
                  <div className={styles.workplaceText}>
                    <h3>신해철 작업실 둘러보기</h3>
                    <div className={styles.textContent}>
                      <p>성남시 분당구 수내동에 위치한 신해철의 음악 작업실</p>
                      <p>해철이 형과 예전보다 더 가까워져서 분당에 있는 작업실에서 음악도 만들고 그랬다.</p>
                      <p>해철이 형은 내게 '만년 소년' 같은 존재였다.</p>
                      <p>음악에 대한 열정이라는 측면에 있어서 정말 화수분 같은 사람이라고 할까...</p>
                      <p>그 작고 작은 공간이었지만 우리에게는 거대한 우주같은 공간이었다.</p>
                      <p style={{marginTop: '20px', fontSize: '14px', color: '#999'}}>※ 2023년 12월까지 무료 개방, 2024년부터 운영 종료</p>
                    </div>
                  </div>
                  <div className={styles.workplaceImages}>
                    <img src="https://cromst.seongnam.go.kr:10005/images/content/street_workspace/img_ws1.jpg" alt="음악작업실 1" />
                    <img src="https://cromst.seongnam.go.kr:10005/images/content/street_workspace/img_ws2.jpg" alt="음악작업실 2" />
                    <img src="https://cromst.seongnam.go.kr:10005/images/content/street_workspace/img_ws3.jpg" alt="음악작업실 3" />
                  </div>
                </div>
              ) : (
                <div className={styles.workplaceLibrary}>
                  <div className={styles.libraryGrid}>
                    <div className={styles.libraryItem}>
                      <img src="https://cromst.seongnam.go.kr:10005/images/content/street_workspace/img_ws4.jpg" alt="서재 공간" />
                      <h4>서재</h4>
                      <p>신해철이 음악 작업 중 휴식을 취하며 독서를 즐기던 공간</p>
                    </div>
                    <div className={styles.libraryItem}>
                      <img src="https://cromst.seongnam.go.kr:10005/images/content/street_workspace/img_ws5.jpg" alt="레코드실 1" />
                      <h4>레코드실</h4>
                      <p>수많은 LP와 CD가 보관된 음악 아카이브</p>
                    </div>
                    <div className={styles.libraryItem}>
                      <img src="https://cromst.seongnam.go.kr:10005/images/content/street_workspace/img_ws6.jpg" alt="레코드실 2" />
                      <h4>컬렉션</h4>
                      <p>다양한 장르의 음반들과 음악 관련 서적들</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StreetMap;