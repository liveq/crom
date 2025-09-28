import React, { useState } from 'react';
import styles from './Pages.module.css';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  phone: string;
  address: string;
  mapUrl: string;
  imageUrl: string;
  section: string;
}

const FoodGuide: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0);

  const restaurants: Restaurant[] = [
    // Section 1: 게이트 ~ 수내어린이공원
    {
      id: 1,
      name: "주막골",
      cuisine: "부대찌개, 곱창전골, 왕새우소금구이",
      phone: "031-719-1182",
      address: "발이봉로3번길 2",
      mapUrl: "http://dmaps.kr/7p85a",
      imageUrl: "/food-images/img_food1.jpg",
      section: "게이트 ~ 수내어린이공원"
    },
    {
      id: 2,
      name: "Coffee ole(나타샤)",
      cuisine: "커피, 티, 밀크티",
      phone: "031-717-4605",
      address: "발이봉로 10",
      mapUrl: "http://dmaps.kr/7p85e",
      imageUrl: "/food-images/img_food2.jpg",
      section: "게이트 ~ 수내어린이공원"
    },
    {
      id: 3,
      name: "돈가스맘",
      cuisine: "돈가스",
      phone: "031-716-1617",
      address: "발이봉로 10",
      mapUrl: "http://dmaps.kr/7p85e",
      imageUrl: "/food-images/img_food3.jpg",
      section: "게이트 ~ 수내어린이공원"
    },
    {
      id: 4,
      name: "니하오",
      cuisine: "중국음식점",
      phone: "031-714-5028",
      address: "발이봉로3번길 9",
      mapUrl: "http://dmaps.kr/7nq86",
      imageUrl: "/food-images/img_food5.jpg",
      section: "게이트 ~ 수내어린이공원"
    },
    {
      id: 5,
      name: "버스킹",
      cuisine: "맥주, 소주, 치킨",
      phone: "070-8888-1379",
      address: "발이봉로3번길 9",
      mapUrl: "http://dmaps.kr/7nq86",
      imageUrl: "/food-images/img_food6.jpg",
      section: "게이트 ~ 수내어린이공원"
    },
    // Section 2: 신해철음악작업실 ~ 공영주차장
    {
      id: 6,
      name: "추억의 연탄불고기",
      cuisine: "연탄갈비, 고추장삼겹살, 소막창 등",
      phone: "031-716-5881",
      address: "불정로 254",
      mapUrl: "http://dmaps.kr/7p864",
      imageUrl: "/food-images/img_food9.jpg",
      section: "신해철음악작업실 ~ 공영주차장"
    },
    {
      id: 7,
      name: "우동다께야",
      cuisine: "초밥류, 우동, 모밀",
      phone: "031-716-1465",
      address: "발이봉로 6",
      mapUrl: "http://dmaps.kr/7p867",
      imageUrl: "/food-images/img_food10.jpg",
      section: "신해철음악작업실 ~ 공영주차장"
    },
    {
      id: 8,
      name: "미소회초밥",
      cuisine: "초밥, 회, 우동, 알탕",
      phone: "031-713-4002",
      address: "발이봉로3번길 12",
      mapUrl: "http://dmaps.kr/2e99o",
      imageUrl: "/food-images/img_food11.jpg",
      section: "신해철음악작업실 ~ 공영주차장"
    },
    {
      id: 9,
      name: "철뚝집",
      cuisine: "삼겹살, 김치찜, 돼지불백",
      phone: "031-714-9951",
      address: "발이봉로3번길 10",
      mapUrl: "http://dmaps.kr/7p86o",
      imageUrl: "/food-images/img_food12.jpg",
      section: "신해철음악작업실 ~ 공영주차장"
    },
    {
      id: 10,
      name: "스탄불숯불바비큐",
      cuisine: "숯불바베큐, 치킨",
      phone: "031-716-5299",
      address: "발이봉로3번길 8-1",
      mapUrl: "http://dmaps.kr/7p86r",
      imageUrl: "/food-images/img_food13.jpg",
      section: "신해철음악작업실 ~ 공영주차장"
    },
    {
      id: 11,
      name: "참숯화로구이",
      cuisine: "돼지갈비, 생삼겹살, 안창살, 냉면, 김치찌개",
      phone: "031-711-7244",
      address: "발이봉로3번길 6",
      mapUrl: "http://dmaps.kr/7p86w",
      imageUrl: "/food-images/img_food15.jpg",
      section: "신해철음악작업실 ~ 공영주차장"
    },
    // Section 3: 발이봉남로7번길 7-1 / 발이봉남로15번길 2
    {
      id: 12,
      name: "반올림 피자샵",
      cuisine: "피자",
      phone: "031-714-5882",
      address: "발이봉남로7번길 7-1",
      mapUrl: "http://dmaps.kr/7p896",
      imageUrl: "/food-images/img_food23.jpg",
      section: "발이봉남로7번길 7-1 / 발이봉남로15번길 2"
    },
    {
      id: 13,
      name: "산촌버섯매운탕",
      cuisine: "버섯칼국수, 새우칼국수",
      phone: "031-717-1455",
      address: "발이봉남로15번길 2",
      mapUrl: "http://dmaps.kr/7p89b",
      imageUrl: "/food-images/img_food24.jpg",
      section: "발이봉남로7번길 7-1 / 발이봉남로15번길 2"
    },
    // Section 4: 발이봉남로 14 ~ 발이봉남로 6
    {
      id: 14,
      name: "수내생고기집",
      cuisine: "김치찌개, 갈비탕",
      phone: "031-717-0448",
      address: "발이봉남로 14",
      mapUrl: "http://dmaps.kr/7p89d",
      imageUrl: "/food-images/img_food25.jpg",
      section: "발이봉남로 14 ~ 발이봉남로 6"
    },
    {
      id: 15,
      name: "써니포차",
      cuisine: "실내포장마차",
      phone: "031-777-2344",
      address: "발이봉남로12번길 4",
      mapUrl: "http://dmaps.kr/7p89e",
      imageUrl: "/food-images/img_food26.jpg",
      section: "발이봉남로 14 ~ 발이봉남로 6"
    },
    {
      id: 16,
      name: "김명진보리밥해장국",
      cuisine: "보리밥, 해장국",
      phone: "031-716-8077",
      address: "발이봉남로 6",
      mapUrl: "http://dmaps.kr/7p89i",
      imageUrl: "/food-images/img_food27.jpg",
      section: "발이봉남로 14 ~ 발이봉남로 6"
    },
    // Section 5: 불정로 25 ~ 불정로 260
    {
      id: 17,
      name: "맘스떡볶이",
      cuisine: "떡볶이",
      phone: "031-714-8825",
      address: "불정로 254",
      mapUrl: "http://dmaps.kr/7p864",
      imageUrl: "/food-images/img_food28.jpg",
      section: "불정로 25 ~ 불정로 260"
    },
    {
      id: 18,
      name: "이디아커피",
      cuisine: "커피",
      phone: "",
      address: "불정로 254",
      mapUrl: "http://dmaps.kr/7p864",
      imageUrl: "/food-images/img_food29.jpg",
      section: "불정로 25 ~ 불정로 260"
    },
    {
      id: 19,
      name: "김밥천국",
      cuisine: "김밥",
      phone: "031-719-7564",
      address: "불정로 256",
      mapUrl: "http://dmaps.kr/7p85w",
      imageUrl: "/food-images/img_food30.jpg",
      section: "불정로 25 ~ 불정로 260"
    },
    {
      id: 20,
      name: "롯데리아",
      cuisine: "햄버거",
      phone: "031-713-2229",
      address: "불정로 256",
      mapUrl: "http://dmaps.kr/7p85w",
      imageUrl: "/food-images/img_food32.jpg",
      section: "불정로 25 ~ 불정로 260"
    },
    // Section 6: 발이봉북로 16 ~ 14
    {
      id: 21,
      name: "신전떡볶이",
      cuisine: "떡볶이",
      phone: "031-711-1151",
      address: "발이봉로 16",
      mapUrl: "http://dmaps.kr/7p8ad",
      imageUrl: "/food-images/img_food37.jpg",
      section: "발이봉북로 16 ~ 14"
    },
    {
      id: 22,
      name: "카페메이",
      cuisine: "커피",
      phone: "031-714-5589",
      address: "발이봉로 14",
      mapUrl: "http://dmaps.kr/7p8ag",
      imageUrl: "/food-images/img_food38.jpg",
      section: "발이봉북로 16 ~ 14"
    }
  ];

  const sections = [
    "게이트 ~ 수내어린이공원",
    "신해철음악작업실 ~ 공영주차장",
    "발이봉남로7번길 7-1 / 발이봉남로15번길 2",
    "발이봉남로 14 ~ 발이봉남로 6",
    "불정로 25 ~ 불정로 260",
    "발이봉북로 16 ~ 14"
  ];

  const getRestaurantsBySection = (section: string) => {
    return restaurants.filter(restaurant => restaurant.section === section);
  };

  const handleMapClick = (mapUrl: string) => {
    window.open(mapUrl, '_blank');
  };

  const handlePhoneClick = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`);
    }
  };

  const handlePrevSection = () => {
    setCurrentSection((prev) => (prev > 0 ? prev - 1 : sections.length - 1));
  };

  const handleNextSection = () => {
    setCurrentSection((prev) => (prev < sections.length - 1 ? prev + 1 : 0));
  };

  const currentSectionName = sections[currentSection];
  const currentRestaurants = getRestaurantsBySection(currentSectionName);

  return (
    <div className={styles.pageContent}>
      <h2 className={styles.pageTitle}>먹거리</h2>
      <p className={styles.pageSubtitle}>
        신해철 거리 주변 맛집 정보
      </p>

      {/* 섹션 네비게이션 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <button
          onClick={handlePrevSection}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          ‹
        </button>

        <div style={{
          textAlign: 'center',
          minWidth: '300px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '8px'
          }}>
            {currentSectionName}
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            {currentSection + 1} / {sections.length} 구역
          </p>
        </div>

        <button
          onClick={handleNextSection}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          ›
        </button>
      </div>

      {/* 현재 섹션의 음식점들 */}
      <div className="food_list1" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {currentRestaurants.map((restaurant) => (
          <div key={restaurant.id} className="box" style={{
            position: 'relative',
            borderRadius: '0',
            overflow: 'hidden',
            backgroundColor: '#000',
            cursor: 'pointer',
            height: '280px'
          }}>
            {/* 이미지 - 항상 보임 */}
            <div className="image" style={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}>
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                }}
              />

              {/* 하단 음식점 이름 - 항상 보임 */}
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
                {restaurant.name}
              </div>
            </div>

            {/* 호버시 올라오는 오버레이 */}
            <div className="overlay" style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '30px 20px 20px',
              display: 'flex',
              flexDirection: 'column',
              transform: 'translateY(100%)',
              transition: 'transform 0.3s ease-in-out'
            }}>
              {/* 지도 아이콘 버튼 - 우측 상단 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMapClick(restaurant.mapUrl);
                }}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                title="지도보기"
              >
                📍
              </button>

              {/* 음식점 이름 */}
              <h4 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '20px',
                marginTop: '10px'
              }}>
                {restaurant.name}
              </h4>

              {/* 음식 종류 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                <span>🍴</span>
                <span>{restaurant.cuisine}</span>
              </div>

              {/* 전화번호 */}
              {restaurant.phone && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '15px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePhoneClick(restaurant.phone);
                  }}
                >
                  <span>📞</span>
                  <span>{restaurant.phone}</span>
                </div>
              )}

              {/* 주소 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}>
                <span>📍</span>
                <span>{restaurant.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지 인디케이터 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '20px'
      }}>
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: index === currentSection ? '#f39c12' : 'rgba(255, 255, 255, 0.3)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .box:hover .overlay {
          transform: translateY(0) !important;
        }

        .box {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: box-shadow 0.3s ease;
        }

        .box:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        @media (max-width: 1200px) {
          .food_list1 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .food_list1 {
            grid-template-columns: 1fr !important;
            gap: 15px;
          }

          .box {
            height: 250px !important;
          }

          .overlay {
            padding: 20px 15px 15px !important;
          }

          .overlay h4 {
            font-size: 18px !important;
            margin-bottom: 15px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FoodGuide;