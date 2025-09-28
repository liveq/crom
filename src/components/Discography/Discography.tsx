import React, { useState, useEffect } from 'react';
import albumsData from '../../data/albums.json';
import { getImagePath } from '../../utils/assetPaths';
import './Discography.css';

interface Album {
  title: string;
  year: string;
  cover: string;
  artist: string;
}

const Discography: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'solo' | 'next'>('solo');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(999);
  const [isMobile, setIsMobile] = useState(false);

  const albums = activeTab === 'solo' ? albumsData.solo : albumsData.next;

  // 반응형 체크
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setItemsPerPage(2); // 모바일: 2개씩
      } else {
        setItemsPerPage(999); // PC: 모든 아이템 표시
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 탭 변경시 페이지 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(albums.length / itemsPerPage);
  const paginatedAlbums = isMobile
    ? albums.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
      )
    : albums; // PC에서는 모든 앨범 표시

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
    <section id="discography" className="discography-section">
      <div className="section-container">
        <h2 className="section-title">디스코그래피</h2>
        <p className="section-subtitle">신해철과 N.EX.T의 음악 여정</p>

        <div className="disco-tabs">
          <button
            className={`disco-tab ${activeTab === 'solo' ? 'active' : ''}`}
            onClick={() => setActiveTab('solo')}
          >
            Solo
          </button>
          <button
            className={`disco-tab ${activeTab === 'next' ? 'active' : ''}`}
            onClick={() => setActiveTab('next')}
          >
            N.EX.T
          </button>
        </div>

        <div className="disco-content">
          <div className="albums-grid">
            {paginatedAlbums.map((album, index) => (
              <div key={index} className="album-card">
                <div className="album-cover">
                  <img
                    src={getImagePath(album.cover)}
                    alt={album.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // 넥스트 앨범 이미지 오류 시 원본 서버 이미지로 대체
                      if (activeTab === 'next' && !target.src.includes('cromst.seongnam.go.kr')) {
                        const albumIndex = albumsData.next.indexOf(album) + 1;
                        target.src = `https://cromst.seongnam.go.kr:10005/images/content/album/next_album${albumIndex}.jpg`;
                      }
                    }}
                  />
                  <div className="album-overlay">
                    <span className="play-icon">▶</span>
                  </div>
                </div>
                <div className="album-info">
                  <h3>{album.title}</h3>
                  <p>{album.year}</p>
                  <span className="album-artist">{album.artist}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 - 모바일에서만 표시 */}
          {isMobile && totalPages > 1 && (
            <div className="pagination">
              {(() => {
                const pages = [];

                // 모바일: 5페이지 이전 버튼 (항상 표시) - 가장 왼쪽
                pages.push(
                  <button
                    key="jump-prev"
                    className="page-button"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 5))}
                    disabled={currentPage === 0}
                  >
                    ««
                  </button>
                );

                // 이전 버튼
                pages.push(
                  <button
                    key="prev"
                    className="page-button"
                    onClick={goToPrevPage}
                    disabled={currentPage === 0}
                  >
                    ‹
                  </button>
                );

                // 페이지 번호들
                const maxVisible = 5;
                let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
                const endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

                if (endPage - startPage < maxVisible - 1) {
                  startPage = Math.max(0, endPage - maxVisible + 1);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`page-button ${currentPage === i ? 'active' : ''}`}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i + 1}
                    </button>
                  );
                }

                // 다음 버튼
                pages.push(
                  <button
                    key="next"
                    className="page-button"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages - 1}
                  >
                    ›
                  </button>
                );

                // 모바일: 5페이지 다음 버튼 (항상 표시) - 가장 오른쪽
                pages.push(
                  <button
                    key="jump-next"
                    className="page-button"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 5))}
                    disabled={currentPage === totalPages - 1}
                  >
                    »»
                  </button>
                );

                return pages;
              })()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Discography;