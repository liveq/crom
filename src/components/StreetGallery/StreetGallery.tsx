/**
 * 신해철 거리 갤러리 컴포넌트
 * 인터랙티브 맵과 구간별 사진 표시
 */

import React, { useState } from 'react';
import styles from './StreetGallery.module.css';
import StreetMap from './StreetMap';
import WorkPlace from './WorkPlace';
import FoodGuide from './FoodGuide';
import Attractions from './Attractions';
import Directions from './Directions';
import Construction from './Construction';

const StreetGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map');

  React.useEffect(() => {
    const handleTabChange = (event: any) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('changeTab', handleTabChange);
    return () => {
      window.removeEventListener('changeTab', handleTabChange);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <StreetMap />;
      case 'workplace':
        return <WorkPlace />;
      case 'construction':
        return <Construction />;
      case 'food':
        return <FoodGuide />;
      case 'attractions':
        return <Attractions />;
      case 'directions':
        return <Directions />;
      default:
        return <StreetMap />;
    }
  };

  return (
    <section className={styles.streetGallery}>
      <div className={`${styles.container} ${activeTab === 'map' ? styles.containerMap : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>신해철 거리</h2>
        </div>

        <div className={styles.subNav}>
          <a
            href="#"
            className={`${styles.navItem} ${activeTab === 'map' ? styles.active : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('map'); }}
          >
            신해철 거리 둘러보기
          </a>
          <span className={styles.separator}>/</span>
          <a
            href="#"
            className={`${styles.navItem} ${activeTab === 'construction' ? styles.active : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('construction'); }}
          >
            준공과정 둘러보기
          </a>
          <span className={styles.separator}>/</span>
          <a
            href="#"
            className={`${styles.navItem} ${activeTab === 'food' ? styles.active : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('food'); }}
          >
            먹거리
          </a>
          <span className={styles.separator}>/</span>
          <a
            href="#"
            className={`${styles.navItem} ${activeTab === 'attractions' ? styles.active : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('attractions'); }}
          >
            볼거리
          </a>
          <span className={styles.separator}>/</span>
          <a
            href="#"
            className={`${styles.navItem} ${activeTab === 'directions' ? styles.active : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('directions'); }}
          >
            찾아오시는길
          </a>
        </div>

        {renderContent()}
      </div>
    </section>
  );
};

export default StreetGallery;