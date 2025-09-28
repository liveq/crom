import React from 'react';
import styles from './Pages.module.css';

const Directions: React.FC = () => {
  return (
    <div className={styles.pageContent}>
      <h2 className={styles.pageTitle}>찾아오시는길</h2>

      {/* 주소 섹션 */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '40px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '20px'
        }}>
          신해철거리 주소
        </h3>
        <p style={{
          fontSize: '16px',
          color: '#555',
          lineHeight: '1.8'
        }}>
          성남시 분당구 수내동 발이봉로3번길
        </p>
      </div>

      {/* 교통편 안내 */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '25px'
        }}>
          대중교통 이용 안내
        </h3>

        {/* 지하철 */}
        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '25px',
          marginBottom: '20px'
        }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#f39c12',
            marginBottom: '15px'
          }}>
            지하철
          </h4>
          <p style={{
            fontSize: '15px',
            color: '#666',
            lineHeight: '1.8'
          }}>
            수인분당선 수내역 1,4번 출구<br />
            1번 출구: 도보 10분 (700m)<br />
            4번 출구: 도보 15분 (1km)
          </p>
        </div>

        {/* 버스 */}
        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '25px',
          marginBottom: '20px'
        }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#3498db',
            marginBottom: '15px'
          }}>
            버스
          </h4>

          <div style={{ marginBottom: '15px' }}>
            <h5 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#555',
              marginBottom: '8px'
            }}>
              수내동공영주차장.신해철거리 정류장 (07-086)
            </h5>
            <div style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.8'
            }}>
              <p style={{ margin: '5px 0' }}>
                <strong>직행:</strong> 9607
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>일반:</strong> 17, 33
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>마을:</strong> 109-1, 115
              </p>
            </div>
          </div>

          <div>
            <h5 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#555',
              marginBottom: '8px'
            }}>
              수내역1,4번출구 정류장 (07-150)
            </h5>
            <div style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.8'
            }}>
              <p style={{ margin: '5px 0' }}>
                <strong>일반:</strong> 33, 75
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>마을:</strong> 3-2, 115, 810
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 주차 안내 */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '25px'
        }}>
          주차 안내
        </h3>

        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '25px'
        }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#27ae60',
            marginBottom: '15px'
          }}>
            수내 제1 공영주차장
          </h4>

          <table style={{
            width: '100%',
            fontSize: '14px',
            color: '#666',
            borderCollapse: 'collapse'
          }}>
            <tbody>
              <tr>
                <td style={{
                  padding: '10px 15px 10px 0',
                  fontWeight: 'bold',
                  verticalAlign: 'top',
                  width: '120px'
                }}>
                  주소
                </td>
                <td style={{ padding: '10px 0' }}>
                  성남시 분당구 발이봉로3번길 11 (수내동)
                </td>
              </tr>
              <tr>
                <td style={{
                  padding: '10px 15px 10px 0',
                  fontWeight: 'bold',
                  verticalAlign: 'top'
                }}>
                  운영시간
                </td>
                <td style={{ padding: '10px 0' }}>
                  24시간
                </td>
              </tr>
              <tr>
                <td style={{
                  padding: '10px 15px 10px 0',
                  fontWeight: 'bold',
                  verticalAlign: 'top'
                }}>
                  주차면수
                </td>
                <td style={{ padding: '10px 0' }}>
                  총 253면
                </td>
              </tr>
              <tr>
                <td style={{
                  padding: '10px 15px 10px 0',
                  fontWeight: 'bold',
                  verticalAlign: 'top'
                }}>
                  이용요금
                </td>
                <td style={{ padding: '10px 0', lineHeight: '1.8' }}>
                  <strong>승용차:</strong><br />
                  - 최초 30분: 1,000원<br />
                  - 초과 10분당: 500원<br />
                  - 1일 최대: 15,000원<br />
                  <br />
                  <strong>대형차:</strong><br />
                  - 최초 30분: 2,000원<br />
                  - 초과 10분당: 1,000원<br />
                  - 1일 최대: 30,000원
                </td>
              </tr>
              <tr>
                <td style={{
                  padding: '10px 15px 10px 0',
                  fontWeight: 'bold',
                  verticalAlign: 'top'
                }}>
                  감면대상
                </td>
                <td style={{ padding: '10px 0', lineHeight: '1.8' }}>
                  경차·저공해차: 50% 감면<br />
                  장애인·국가유공자: 80% 감면<br />
                  다자녀: 50% 감면 (2시간 한도)
                </td>
              </tr>
              <tr>
                <td style={{
                  padding: '10px 15px 10px 0',
                  fontWeight: 'bold',
                  verticalAlign: 'top'
                }}>
                  문의
                </td>
                <td style={{ padding: '10px 0' }}>
                  031-704-1225
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 지도 링크 */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '20px'
        }}>
          지도 서비스
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => {
              window.open('https://map.naver.com/v5/search/성남시%20분당구%20수내동%20발이봉로3번길', '_blank');
            }}
            style={{
              padding: '12px 30px',
              background: '#03c75a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: '500',
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
              window.open('https://map.kakao.com/link/search/성남시%20분당구%20수내동%20발이봉로3번길', '_blank');
            }}
            style={{
              padding: '12px 30px',
              background: '#fee500',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: '500',
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
        </div>
      </div>
    </div>
  );
};

export default Directions;