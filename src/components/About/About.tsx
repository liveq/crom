/**
 * About 컴포넌트
 * 신해철 프로필 및 바이오그래피
 */

import React from 'react';
import styles from './About.module.css';
import { getImagePath } from '../../utils/assetPaths';

interface AboutProps {
  showFullBio?: boolean;
}

const About: React.FC<AboutProps> = ({ showFullBio = false }) => {
  return (
    <section className={styles.about} id="about">
      <div className={styles.container}>
        <h2 className={styles.title}>신해철</h2>
        <p className={styles.subtitle}>Shin Hae-chul (1968.05.06 - 2014.10.27)</p>

        <div className={styles.content}>
          <div className={styles.profile}>
            <div className={styles.profileImage}>
              <img src={getImagePath("/images/optimized/shin_album1.jpg")} alt="신해철" />
            </div>

            <div className={styles.profileInfo}>
              <h3>프로필</h3>
              <ul className={styles.infoList}>
                <li><span>본명</span>신해철 (申海澈)</li>
                <li><span>출생</span>1968년 5월 6일, 서울특별시</li>
                <li><span>사망</span>2014년 10월 27일 (향년 46세)</li>
                <li><span>직업</span>가수, 작곡가, 프로듀서, 라디오 DJ</li>
                <li><span>장르</span>록, 일렉트로닉, 프로그레시브</li>
                <li><span>활동</span>1988년 - 2014년</li>
                <li><span>소속</span>무한궤도, N.EX.T, 비트겐슈타인</li>
              </ul>
            </div>
          </div>

          <div className={styles.biography}>
            <h3>바이오그래피</h3>
            <div className={styles.bioContent}>
              <p>
                신해철은 1988년 대학가요제에서 무한궤도로 대상을 수상하며 데뷔했다.
                이후 1992년 록 밴드 N.EX.T(넥스트)를 결성하여 한국 록 음악의 새로운 지평을 열었다.
              </p>

              <p>
                '날아라 병아리', '그대에게', 'Lazenca, Save Us' 등 수많은 명곡을 남겼으며,
                음악적 실험과 도전을 멈추지 않았던 진정한 아티스트였다.
              </p>

              <p>
                음악 외에도 라디오 DJ, 음악 프로듀서로 활동하며 후배 양성에 힘썼고,
                사회 비판적 발언과 행동으로 '마왕'이라는 별명을 얻었다.
              </p>

              {showFullBio && (
                <>
                  <h4>주요 활동</h4>
                  <ul className={styles.timeline}>
                    <li>
                      <span className={styles.year}>1988</span>
                      <span className={styles.event}>무한궤도로 대학가요제 대상</span>
                    </li>
                    <li>
                      <span className={styles.year}>1992</span>
                      <span className={styles.event}>N.EX.T 결성</span>
                    </li>
                    <li>
                      <span className={styles.year}>1997</span>
                      <span className={styles.event}>솔로 1집 'Myself' 발매</span>
                    </li>
                    <li>
                      <span className={styles.year}>2001</span>
                      <span className={styles.event}>MBC FM4U '신해철의 고스트스테이션' DJ</span>
                    </li>
                    <li>
                      <span className={styles.year}>2008</span>
                      <span className={styles.event}>N.EX.T 재결합</span>
                    </li>
                    <li>
                      <span className={styles.year}>2014</span>
                      <span className={styles.event}>10월 27일 별세</span>
                    </li>
                  </ul>

                  <h4>수상 경력</h4>
                  <ul className={styles.awards}>
                    <li>1988년 MBC 대학가요제 대상 (무한궤도)</li>
                    <li>1993년 골든디스크 본상</li>
                    <li>1995년 대한민국 영상음반대상 록 부문</li>
                    <li>2004년 한국대중음악상 네티즌이 뽑은 음악인</li>
                    <li>2015년 대한민국 대중문화예술상 보관문화훈장 (추서)</li>
                  </ul>
                </>
              )}
            </div>

            {!showFullBio && (
              <a href="#more" className={styles.moreLink}>
                전체 바이오그래피 보기
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;