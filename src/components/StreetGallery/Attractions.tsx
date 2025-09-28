import React, { useState, useEffect } from 'react';
import styles from './Pages.module.css';
import { getImagePath } from '../../utils/assetPaths';

interface Attraction {
  id: number;
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  page: number;
}

const Attractions: React.FC = () => {
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const attractions: Attraction[] = [
    // Page 1
    {
      id: 1,
      name: "망경암 마애여래좌상",
      description: "1980년 6월 2일 경기도 유형문화재 제102호로 지정 1300년 전부터 전해오니는 암석을 조각하여 좌 앞면인 화강암에 삼막된 압면에 육조 사찰의 장애를 오시트...",
      address: "경기도 성남시 수정구 복정동 산65",
      imageUrl: getImagePath("/attraction-images/img_travel1.jpg"),
      page: 1
    },
    {
      id: 2,
      name: "채테마파크",
      description: "책을파르크는 시민들이 함께 하는 다양한 체험, 공연, 전시행사 등으로 방문객들이 책과 자연스럽게 친숙해질 수 있는 기회를 제공해 책과 함께 숨쉬트...",
      address: "경기도 성남시 분당구 문정로 145",
      imageUrl: getImagePath("/attraction-images/img_travel2.jpg"),
      page: 1
    },
    {
      id: 3,
      name: "성남시 민속공예전시관",
      description: "공예산업 부지와 전통문화의 전승 및 발걸음 위해 설립 공정자진 최신 빈곤재산 박문업들에는 논문 문화 조율 에잘과 정신다 전시난시는 작와시의 가치발...",
      address: "경기도 성남시 중원구 산성대로 476번길 5-3",
      imageUrl: getImagePath("/attraction-images/img_travel3.jpg"),
      page: 1
    },
    {
      id: 4,
      name: "신대동 전통명상센터",
      description: "전통명상과 현대명상을 체험할 수 있는 명상 전문센터. 다양한 명상 프로그램과 힐링 체험을 제공한다.",
      address: "경기도 성남시 수정구 신촌남로 47",
      imageUrl: getImagePath("/attraction-images/img_travel4.jpg"),
      page: 1
    },
    {
      id: 5,
      name: "한국잡월드",
      description: "청소년들이 다양한 직업을 체험하고 진로를 탐색할 수 있는 국내 최대 규모의 직업체험관. 어린이체험관, 청소년체험관 등으로 구성되어 있다.",
      address: "경기도 성남시 분당구 분당수서로 501",
      imageUrl: getImagePath("/attraction-images/img_travel5.jpg"),
      page: 1
    },
    {
      id: 6,
      name: "신구대학교식물원",
      description: "사계절 아름다운 식물들을 관찰할 수 있는 생태학습장. 온실, 약용식물원, 습지원 등 테마별 정원과 산책로가 조성되어 있다.",
      address: "경기도 성남시 수정구 적푸리로 9",
      imageUrl: getImagePath("/attraction-images/img_travel6.jpg"),
      page: 1
    },
    // Page 2
    {
      id: 7,
      name: "판교환경생태학습원",
      description: "어린이들에게 평소 접으로만 접했던 숲, 습지 등의 생태계를 생생히 관찰할 수 있고 흙바닥도 맘껏 뒹굴어볼 수 있는 신재생 에너지 등 생소한 환경...",
      address: "경기도 성남시 분당구 대왕판교로 645번길 21",
      imageUrl: getImagePath("/attraction-images/img_travel7.jpg"),
      page: 2
    },
    {
      id: 8,
      name: "판교박물관",
      description: "삼국시 최초 공립박물관 판교박물관은 1600여 점 한성백제시대 석실분 밀집 지역으로 삼국시대의 능묵과 교통을 보여주는 중거의 한성백제 최대 규모의...",
      address: "경기도 성남시 분당구 판교로 191",
      imageUrl: getImagePath("/attraction-images/img_travel8.jpg"),
      page: 2
    },
    {
      id: 9,
      name: "정자동 카페거리",
      description: "해외에서 보던 멋진 거리 정자동 카페거리는 아름답고 맛진 테라스로 이루어져 있어 마치 외국의 명품거리에 온 듯한 착각이 들 정도로 이국적인 분위기를...",
      address: "경기도 성남시 분당구 정자동",
      imageUrl: getImagePath("/attraction-images/img_travel9.jpg"),
      page: 2
    },
    {
      id: 10,
      name: "율동공원",
      description: "자연 그대로의 환림공간 율동공원은 물을 이용한 자연호수·공원으로 중앙에 간단한 어린 시절로 많은 안전공원이며 분위기와 경인수호로서 차지하는 단순...",
      address: "경기도 성남시 분당구 문정로 145",
      imageUrl: getImagePath("/attraction-images/img_travel10.jpg"),
      page: 2
    },
    {
      id: 11,
      name: "탄천변",
      description: "생태학습에서 레저까지 우리들의 웰빙 명소 30.6km 거리의 탄천에 우리 시내를 구간 산책로 아스팔트와 자전거 도로가 있고 이곳주변 없길이 탄천로...",
      address: "경기도 성남시 분당구 탄천변로",
      imageUrl: getImagePath("/attraction-images/img_travel11.jpg"),
      page: 2
    },
    {
      id: 12,
      name: "중앙공원",
      description: "역사와 자연을 함께 즐기는 나들이 명소 도심의 중심지에 자리잡은 중앙공원은 역사적인 숲속 수내농장지 아름다운 늦가을의 숲속교육 호안마음 황새울등...",
      address: "경기도 성남시 분당구 황새울로 206",
      imageUrl: getImagePath("/attraction-images/img_travel12.jpg"),
      page: 2
    },
    // Page 3
    {
      id: 13,
      name: "성남아트센터",
      description: "생활이 예술이 되는 곳 아름다운 자연과 함께 시민들이 찾고 싶은 센터. 자기와의 코스트로 차터와커 있는 성남아트센터는 전문 문화예술 공간으로...",
      address: "경기도 성남시 분당구 성남대로 808",
      imageUrl: getImagePath("/attraction-images/img_travel13.jpg"),
      page: 3
    },
    {
      id: 14,
      name: "봉국사 대광명전",
      description: "도심속 특별한 산사 경기도 유형문화재 제101호인 대광명전은 현종 15년(1674) 인금은 언급된 왕의 조은 명예, 명성 두 공주의 명복을 빌기 위해 공주의 능...",
      address: "경기도 성남시 수정구 태평로 79",
      imageUrl: getImagePath("/attraction-images/img_travel14.jpg"),
      page: 3
    },
    {
      id: 15,
      name: "남한산성",
      description: "위기의 순간에도 역사를 이어온 문화유산 남한산성의 역사문화적 가치가 높게 인정되어 2014년 6월 카타르 도하에서 개최된 유네스코 총회에서...",
      address: "경기도 성남시 중원구 남한산성면",
      imageUrl: getImagePath("/attraction-images/img_travel15.jpg"),
      page: 3
    },
    {
      id: 16,
      name: "모란민속 5일장",
      description: "도심에서 열리는 풍프한 5일장 모란은 1960년대 성남동에 열리는 풍프한 5일장과 달리 1960년대 성남에서 열리는 개장하여 최연3300여 천민보오로 누구...",
      address: "경기도 성남시 중원구 둔촌대로 79",
      imageUrl: getImagePath("/attraction-images/img_travel16.jpg"),
      page: 3
    },
    {
      id: 17,
      name: "성남시청",
      description: "시민과 함께하는 문화의 전당 성남시청사는 성남의 중심 지역인 여수지구 시청사 신청사는 시민과 시의 소통 공간, 문화와...",
      address: "경기도 성남시 중원구 성남대로 997",
      imageUrl: getImagePath("/attraction-images/img_travel17.jpg"),
      page: 3
    },
    {
      id: 18,
      name: "성남종합운동장",
      description: "시민의 건강과 여가를 위한 종합 스포츠 공간. 축구장, 야구장 등 다양한 운동시설이 갖춰져 있으며 각종 체육행사가 개최된다.",
      address: "경기도 성남시 중원구 제일로 60",
      imageUrl: getImagePath("/attraction-images/img_travel18.jpg"),
      page: 3
    }
  ];

  // Filter attractions by current page
  const currentAttractions = attractions.filter(a => a.page === currentPage);

  // ESC 키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAttraction(null);
      }
    };

    if (selectedAttraction) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedAttraction]);

  const handleMapClick = (name: string, address: string) => {
    const query = encodeURIComponent(`${name} ${address}`);
    window.open(`https://map.naver.com/v5/search/${query}`, '_blank');
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedAttraction(null);
    }
  };

  return (
    <div className={styles.pageContent}>
      <h2 className={styles.pageTitle}>볼거리</h2>
      <p className={styles.pageSubtitle}>
        신해철 거리 주변 주요 볼거리 및 명소 정보
      </p>

      <div className="travel_list1" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {currentAttractions.map((attraction) => (
          <div
            key={attraction.id}
            className="box"
            onClick={() => setSelectedAttraction(attraction)}
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#000',
              cursor: 'pointer',
              height: '280px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            {/* 이미지 */}
            <div className="image" style={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}>
              <img
                src={attraction.imageUrl}
                alt={attraction.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getImagePath('/placeholder.jpg');
                }}
              />

              {/* 하단 명소 이름 */}
              <div className="bottom-title" style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '10px 15px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {attraction.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        marginTop: '40px',
        marginBottom: '40px'
      }}>
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: currentPage === page ? 'none' : '1px solid #ddd',
              background: currentPage === page ? '#f39c12' : 'white',
              color: currentPage === page ? 'white' : '#666',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== page) {
                (e.currentTarget as HTMLButtonElement).style.background = '#f8f8f8';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== page) {
                (e.currentTarget as HTMLButtonElement).style.background = 'white';
              }
            }}
          >
            {page}
          </button>
        ))}
      </div>

      {/* 모달 */}
      {selectedAttraction && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={handleOutsideClick}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative',
            animation: 'slideUp 0.3s ease',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            {/* 모달 이미지 */}
            <div style={{
              width: '100%',
              height: '300px',
              overflow: 'hidden',
              borderRadius: '12px 12px 0 0'
            }}>
              <img
                src={selectedAttraction.imageUrl}
                alt={selectedAttraction.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* 모달 내용 */}
            <div style={{
              padding: '30px'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '20px'
              }}>
                {selectedAttraction.name}
              </h3>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#555',
                marginBottom: '25px'
              }}>
                {selectedAttraction.description}
              </p>

              <div style={{
                borderTop: '1px solid #e0e0e0',
                paddingTop: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#666',
                  fontSize: '14px',
                  marginBottom: '15px'
                }}>
                  <span style={{ fontSize: '18px' }}>📍</span>
                  <span>{selectedAttraction.address}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMapClick(selectedAttraction.name, selectedAttraction.address);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f39c12',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e67e22';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f39c12';
                  }}
                >
                  지도에서 보기
                </button>
              </div>

              {/* 닫기 버튼 */}
              <button
                onClick={() => setSelectedAttraction(null)}
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  padding: '8px 20px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#555';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#666';
                }}
              >
                닫기
              </button>
            </div>

            {/* X 버튼 (우측 상단) */}
            <button
              onClick={() => setSelectedAttraction(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                fontSize: '20px',
                color: '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 1)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 1200px) {
          .travel_list1 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .travel_list1 {
            grid-template-columns: 1fr !important;
            gap: 15px;
          }

          .box {
            height: 250px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Attractions;