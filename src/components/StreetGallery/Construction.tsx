import React, { useEffect } from 'react';
import styles from './Construction.module.css';
import { getImagePath } from '../../utils/assetPaths';

// Import jQuery and bxSlider
declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
}

const Construction: React.FC = () => {

  useEffect(() => {
    // Load jQuery and bxSlider dynamically
    const loadScripts = async () => {
      // Load jQuery
      if (!window.jQuery) {
        const jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://code.jquery.com/jquery-3.1.1.min.js';
        jqueryScript.onload = () => {
          // Load bxSlider after jQuery is loaded
          const bxSliderScript = document.createElement('script');
          bxSliderScript.src = 'https://cdn.jsdelivr.net/npm/bxslider@4.2.17/dist/jquery.bxslider.min.js';
          bxSliderScript.onload = () => {
            setTimeout(initializeBxSlider, 100); // Small delay to ensure DOM is ready
          };
          document.head.appendChild(bxSliderScript);
        };
        document.head.appendChild(jqueryScript);
      } else {
        // jQuery already loaded, just load bxSlider
        const bxSliderScript = document.createElement('script');
        bxSliderScript.src = 'https://cdn.jsdelivr.net/npm/bxslider@4.2.17/dist/jquery.bxslider.min.js';
        bxSliderScript.onload = () => {
          setTimeout(initializeBxSlider, 100);
        };
        document.head.appendChild(bxSliderScript);
      }

      // Load bxSlider CSS
      const bxSliderCSS = document.createElement('link');
      bxSliderCSS.rel = 'stylesheet';
      bxSliderCSS.href = 'https://cdn.jsdelivr.net/npm/bxslider@4.2.17/dist/jquery.bxslider.min.css';
      document.head.appendChild(bxSliderCSS);
    };

    const initializeBxSlider = () => {
      const $ = window.jQuery;
      if ($ && $.fn.bxSlider) {
        console.log('Initializing bxSlider...');

        // Destroy existing sliders first
        $('.bxslider5').each(function() {
          if ($(this).data('bxSlider')) {
            $(this).destroySlider();
          }
        });

        // Initialize new sliders
        $('.bxslider5').bxSlider({
          mode: 'fade',           // fade transition effect
          speed: 900,             // transition speed (900ms)
          infiniteLoop: true,     // infinite loop enabled
          captions: false,        // no captions
          auto: false,            // no auto-play
          autoHover: false,       // no hover pause
          pause: 5000,            // pause time (not used since auto=false)
          pager: false,           // no pagination dots
          controls: true,         // show prev/next buttons
          autoControls: false,    // no auto-control buttons
          onSliderLoad: function() {
            console.log('bxSlider loaded successfully');
          }
        });
      }
    };

    loadScripts();

    // Cleanup function
    return () => {
      if (window.jQuery && window.jQuery.fn.bxSlider) {
        const $ = window.jQuery;
        $('.bxslider5').each(function() {
          if ($(this).data('bxSlider')) {
            $(this).destroySlider();
          }
        });
      }
    };
  }, []);

  const sections = [
    {
      number: 1,
      title: '진입마당(정면)',
      description: '상징게이트, 추모블럭, 조명열주, 계단(공연석)이 만들어지는 과정입니다.'
    },
    {
      number: 2,
      title: '신해철작업실',
      description: '추모블럭, 음표블럭, 시민들이 휴식할 수 있는 공간이 만들어지는 과정입니다.'
    },
    {
      number: 3,
      title: '추모마당',
      description: '신해철동상, 추모가벽, 음표블럭, 추모블럭이 만들어지는 과정입니다.'
    },
    {
      number: 4,
      title: '진입마당(후면)',
      description: '입구가벽, 추모블럭, 음표블럭, 정원등이 만들어지는 과정입니다.'
    }
  ];

  const generateSlides = (sectionNumber: number) => {
    const slides = [];
    for (let week = 1; week <= 4; week++) {
      for (let photo = 1; photo <= 2; photo++) {
        slides.push(
          <li key={`area${sectionNumber}_week${week}_${photo.toString().padStart(2, '0')}`} className={styles.slideItem}>
            <div className={`${styles.weekTitle} ${styles[`week${week}`]}`}>
              <span>{week}</span>WEEK
            </div>
            <div className={styles.thumb}>
              <img
                src={getImagePath(`/construction-images/area${sectionNumber}_week${week}_${photo.toString().padStart(2, '0')}.jpg`)}
                alt={`${sections[sectionNumber-1].title} ${week}주차 사진${photo}`}
                onError={(e) => {
                  console.log(`Image not found: area${sectionNumber}_week${week}_${photo.toString().padStart(2, '0')}.jpg`);
                  (e.target as HTMLImageElement).src = getImagePath('/placeholder.jpg');
                }}
              />
            </div>
          </li>
        );
      }
    }
    return slides;
  };

  return (
    <div className={styles.constructionContent}>
      <h2 className={styles.pageTitle}>준공과정 둘러보기</h2>

      {/* Introduction */}
      <div className={styles.topbox}>
        신해철거리 준공과정(1주~4주)을 한눈에 확인해보세요!
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.number} className={styles.sectionContainer}>
          <h3 className={styles.streetTitle}>
            <strong>{section.number}구간</strong> {section.title}
          </h3>

          <div className={styles.streetAtoz}>
            <ul className={`bxslider5 ${styles.bxslider5}`}>
              {generateSlides(section.number)}
            </ul>

            <div className={styles.description}>
              {section.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Construction;