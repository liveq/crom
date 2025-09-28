import React, { useState, useEffect } from 'react';
import albumsData from '../../data/albums.json';
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
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const albums = activeTab === 'solo' ? albumsData.solo : albumsData.next;

  // 반응형 아이템 수 설정
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsPerPage(2); // 모바일: 2개씩
      } else if (window.innerWidth <= 1024) {
        setItemsPerPage(4); // 태블릿: 4개
      } else {
        setItemsPerPage(6); // 데스크톱: 6개
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
  const paginatedAlbums = albums.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

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
            신해철 솔로
          </button>
          <button
            className={`disco-tab ${activeTab === 'next' ? 'active' : ''}`}
            onClick={() => setActiveTab('next')}
          >
            N.EX.T
          </button>
        </div>

        <div className="albums-wrapper">
          <div className="albums-grid">
            {paginatedAlbums.map((album: Album, index: number) => (
              <div key={index} className="album-card">
                <div className="album-cover">
                  <img src={album.cover} alt={album.title} loading="lazy" />
                  <div className="album-overlay">
                    <div className="album-info">
                      <h3>{album.title}</h3>
                      <p>{album.year}</p>
                    </div>
                  </div>
                </div>
                <div className="album-details">
                  <h4>{album.title}</h4>
                  <span className="album-year">{album.year}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              {(() => {
                const isMobile = window.innerWidth <= 768;
                const pages = [];

                // 모바일: 5페이지 이전 버튼 (항상 표시) - 가장 왼쪽
                if (isMobile) {
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
                }

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
                const maxVisible = isMobile ? 5 : 10;
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
                if (isMobile) {
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
                }

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