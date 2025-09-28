/**
 * 메인 홈페이지 컴포넌트
 */

import React from 'react';
import ImageCarousel from '../components/ImageCarousel/ImageCarousel';
import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Discography from '../components/Discography/Discography';
import MediaGallery from '../components/MediaGallery/MediaGallery';
import MemorialBoard from '../components/Memorial/MemorialBoard';
import StreetGallery from '../components/StreetGallery/StreetGallery';
import Footer from '../components/Footer/Footer';
import ScrollNav from '../components/ScrollNav/ScrollNav';
import TopButton from '../components/TopButton/TopButton';
import { getImagePath } from '../utils/assetPaths';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  // 캐러셀 이미지 데이터
  const carouselImages = [
    {
      id: '1',
      url: getImagePath('/images/full/2024_main_carousel_3.jpg'),
      alt: '신해철 추모 이미지',
      caption: '영원한 마왕, 우리의 기억 속에'
    },
    {
      id: '2',
      url: getImagePath('/images/full/2024_main_carousel_1.jpg'),
      alt: '신해철 공연 모습',
      caption: '음악으로 세상을 바꾸고자 했던 아티스트',
      year: '1968-2014'
    },
    {
      id: '3',
      url: getImagePath('/images/full/2024_main_carousel_2.jpg'),
      alt: '신해철 무대 위 모습',
      caption: 'N.EX.T의 리더, 대한민국 록의 전설',
      year: '1992-2014'
    }
  ];

  // 샘플 데이터
  const samplePhotos = [
    // 앨범 & 음악 활동
    { id: '1', type: 'photo' as const, title: '솔로 1집 - 슬픈 표정하지 말아요', url: getImagePath('/images/shin_album1.jpg'), date: '1988' },
    { id: '2', type: 'photo' as const, title: '솔로 2집 - Myself', url: getImagePath('/images/shin_album2.jpg'), date: '1991' },
    { id: '3', type: 'photo' as const, title: 'CROM - Orgasm & Trance Works', url: getImagePath('/images/shin_album3.jpg'), date: '1998' },
    { id: '4', type: 'photo' as const, title: 'Monocrom', url: getImagePath('/images/shin_album4.jpg'), date: '2002' },
    { id: '5', type: 'photo' as const, title: 'The Songs for the One', url: getImagePath('/images/shin_album5.jpg'), date: '2007' },
    { id: '6', type: 'photo' as const, title: '무한궤도', url: getImagePath('/images/789534e1953a4f188de4f93bab0f59eb.jpg'), date: '1989' },
    { id: '7', type: 'photo' as const, title: 'N.EX.T 멤버들', url: getImagePath('/images/19143ac7f5c746b7ac2052f7a9111b1e.jpg'), date: '1992' },
    { id: '8', type: 'photo' as const, title: '드럼 연주', url: getImagePath('/images/1b12b2669fca4e0cb8ce309a8ddc2d50.jpg'), date: '공연' },
    { id: '9', type: 'photo' as const, title: '프로필 사진', url: getImagePath('/images/153406c6e642425bb25ccb241cc5485e.jpg'), date: '2010s' },
    { id: '10', type: 'photo' as const, title: '작업실', url: getImagePath('/images/img_ws1.jpg'), date: '스튜디오' },
    { id: '11', type: 'photo' as const, title: '앨범 컬렉션', url: getImagePath('/images/673cb756c4ff43509b0ec613bf02e880.jpg'), date: '음반' },
    // 개인 사진
    { id: '12', type: 'photo' as const, title: '가족과 함께', url: getImagePath('/images/b649b87a9b1249719bb4363603448c88.jpg'), date: '가족' },
    { id: '13', type: 'photo' as const, title: '어린 시절', url: getImagePath('/images/b8860726eb81484faa00d4afdf717490.jpg'), date: '유년기' },
    { id: '14', type: 'photo' as const, title: '소년 시절', url: getImagePath('/images/737c3f17394549b1b883885e878c16c0.jpg'), date: '1970s' },
    { id: '15', type: 'photo' as const, title: '첫돌', url: getImagePath('/images/aab55e843d4741b0afa001479f49e9f5.jpg'), date: '1969' },
  ];

  const sampleMusic = [
    { id: '1', type: 'music' as const, title: '그대에게', url: '#', description: '무한궤도' },
    { id: '2', type: 'music' as const, title: '날아라 병아리', url: '#', description: 'N.EX.T' },
    { id: '3', type: 'music' as const, title: '해에게서 소년에게', url: '#', description: 'N.EX.T' },
  ];

  return (
    <>
      {/* 이미지 캐러셀 - 최상단 */}
      <div id="carousel" className={styles.section}>
        <ImageCarousel
          images={carouselImages}
          autoPlay={false}
        />
      </div>

      {/* 히어로 섹션 */}
      <div id="hero" className={styles.section}>
        <Hero
          backgroundImage=""
          title="영원한 마왕"
          description="음악으로 세상을 바꾸고자 했던 아티스트를 기억합니다"
          showScrollIndicator={false}
          overlay={false}
        />
      </div>

      {/* About 섹션 */}
      <div id="about" className={styles.section}>
        <About showFullBio={true} />
      </div>

      {/* 디스코그래피 섹션 */}
      <div id="discography" className={styles.section}>
        <Discography />
      </div>

      {/* 미디어 갤러리 */}
      <div id="gallery" className={styles.section}>
        <MediaGallery
          photos={samplePhotos}
          music={sampleMusic}
          videos={[]}
        />
      </div>

      {/* 신해철 거리 갤러리 */}
      <div id="street-gallery" className={styles.section}>
        <StreetGallery />
      </div>

      {/* 추모 메시지 */}
      <div id="memorial" className={styles.section}>
        <MemorialBoard />
      </div>

      {/* 푸터 */}
      <Footer
        copyrightHolder="CROM"
        email="memorial@example.com"
      />

      {/* 우측 고정 네비게이션 */}
      <ScrollNav />

      {/* 좌측 하단 TOP 버튼 */}
      <TopButton />
    </>
  );
};

export default HomePage;