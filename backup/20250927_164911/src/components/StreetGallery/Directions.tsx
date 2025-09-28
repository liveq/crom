import React from 'react';
import styles from './Pages.module.css';

const Directions: React.FC = () => {
  const transportOptions = [
    {
      type: "지하철",
      icon: "🚇",
      title: "분당선 야탑역",
      description: "3번 출구에서 도보 2분",
      details: [
        "분당선 야탑역 3번 출구 이용",
        "출구에서 직진 후 좌측으로 이동",
        "신해철 거리 게이트까지 약 150m"
      ],
      color: "#f39c12"
    },
    {
      type: "버스",
      icon: "🚌",
      title: "야탑역 정류장",
      description: "야탑역 인근 각종 버스 이용",
      details: [
        "마을버스: 2, 71, 75번",
        "일반버스: 55, 55-1, 357번",
        "광역버스: 9007, 9407번",
        "야탑역 정류장 하차 후 도보 3분"
      ],
      color: "#3498db"
    },
    {
      type: "자가용",
      icon: "🚗",
      title: "네비게이션 검색",
      description: "야탑역 3번 출구 또는 신해철 거리 검색",
      details: [
        "주소: 경기도 성남시 분당구 야탑동",
        "야탑역 3번 출구 인근",
        "발이봉로3번길 일대"
      ],
      color: "#27ae60"
    }
  ];

  const parkingInfo = [
    {
      name: "야탑역 공영주차장",
      address: "경기도 성남시 분당구 야탑동 353-1",
      distance: "도보 3분",
      rate: "30분 1,000원 / 1시간 2,000원",
      hours: "24시간 운영"
    },
    {
      name: "분당구청 주차장",
      address: "경기도 성남시 분당구 분당로 50",
      distance: "도보 8분",
      rate: "30분 무료 / 이후 30분당 500원",
      hours: "평일 09:00-18:00"
    }
  ];

  return (
    <div className={styles.pageContent}>
      <h2 className={styles.pageTitle}>찾아오시는길</h2>
      <p className={styles.pageSubtitle}>
        신해철 거리 오시는 방법을 안내해 드립니다
      </p>

      {/* Location Info */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '15px',
        padding: '30px',
        color: 'white',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}>
          신해철 거리 위치
        </h3>
        <p style={{
          fontSize: '18px',
          marginBottom: '10px'
        }}>
          경기도 성남시 분당구 야탑동
        </p>
        <p style={{
          fontSize: '16px',
          opacity: 0.9
        }}>
          분당선 야탑역 3번 출구 인근
        </p>
      </div>

      {/* Transportation Options */}
      <div style={{ marginBottom: '50px' }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          교통편 안내
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {transportOptions.map((option, index) => (
            <div key={index} style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              border: `3px solid ${option.color}`,
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '40px',
                  background: option.color,
                  padding: '15px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '70px',
                  height: '70px'
                }}>
                  {option.icon}
                </div>

                <div>
                  <div style={{
                    background: option.color,
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginBottom: '8px'
                  }}>
                    {option.type}
                  </div>

                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#333',
                    margin: 0
                  }}>
                    {option.title}
                  </h4>
                </div>
              </div>

              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '15px',
                fontWeight: '500'
              }}>
                {option.description}
              </p>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {option.details.map((detail, detailIndex) => (
                  <li key={detailIndex} style={{
                    fontSize: '13px',
                    color: '#888',
                    marginBottom: '8px',
                    paddingLeft: '15px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '0',
                      color: option.color,
                      fontWeight: 'bold'
                    }}>
                      •
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Parking Information */}
      <div style={{ marginBottom: '50px' }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          주차장 정보
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {parkingInfo.map((parking, index) => (
            <div key={index} style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              border: '2px solid #e0e0e0',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f39c12';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <span style={{ fontSize: '24px' }}>🅿️</span>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: 0
                }}>
                  {parking.name}
                </h4>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <span>📍</span>
                  <span>{parking.address}</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <span>🚶</span>
                  <span>{parking.distance}</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <span>💰</span>
                  <span>{parking.rate}</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <span>🕐</span>
                  <span>{parking.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          위치 지도
        </h3>

        <div style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '2px dashed #ddd'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            🗺️
          </div>
          <p style={{
            fontSize: '18px',
            color: '#666',
            marginBottom: '20px'
          }}>
            정확한 위치는 아래 지도 서비스를 이용해 주세요
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                window.open('https://map.naver.com/v5/search/야탑역%203번%20출구', '_blank');
              }}
              style={{
                padding: '12px 25px',
                background: '#03c75a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = '#02b04d';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = '#03c75a';
              }}
            >
              네이버 지도
            </button>

            <button
              onClick={() => {
                window.open('https://map.kakao.com/link/search/야탑역%203번%20출구', '_blank');
              }}
              style={{
                padding: '12px 25px',
                background: '#fee500',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = '#fdd800';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = '#fee500';
              }}
            >
              카카오맵
            </button>

            <button
              onClick={() => {
                window.open('https://www.google.com/maps/search/야탑역+3번+출구', '_blank');
              }}
              style={{
                padding: '12px 25px',
                background: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = '#3367d6';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = '#4285f4';
              }}
            >
              구글 지도
            </button>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '20px'
        }}>
          문의 및 안내
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            color: '#555'
          }}>
            <span>📞</span>
            <span>성남시청: 031-729-2000</span>
          </div>
          <div style={{
            width: '1px',
            height: '20px',
            background: '#ccc'
          }}></div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            color: '#555'
          }}>
            <span>🌐</span>
            <span>www.seongnam.go.kr</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .transport-grid {
            grid-template-columns: 1fr !important;
          }

          .parking-grid {
            grid-template-columns: 1fr !important;
          }

          .transport-card {
            padding: 20px !important;
          }

          .transport-header {
            flex-direction: column !important;
            text-align: center !important;
            gap: 10px !important;
          }

          .map-buttons {
            flex-direction: column !important;
            align-items: center !important;
          }

          .map-buttons button {
            width: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default Directions;