import React from 'react';
import styles from './Pages.module.css';

const WorkPlace: React.FC = () => {
  return (
    <div className={styles.pageContent}>
      <div className={styles.workplaceContainer}>
        <div className={styles.workspace}>
          <div className={styles.thumb}>
            <span className={styles.tit}>음악작업실</span>
            <img src="/workplace-assets/img_ws1.jpg" alt="음악작업실 내부사진1" />
          </div>
          <div className={styles.thumb}>
            <span className={styles.tit}>음악작업실</span>
            <img src="/workplace-assets/img_ws2.jpg" alt="음악작업실 내부사진2" />
          </div>
          <div className={styles.desc}>
            <p className={styles.titleImage}>
              <img src="/workplace-assets/tit_ws1.png" alt="신해철거리" />
            </p>
            <p>
              성남시 분당구 수내동에 위치한 자신의 음악 작업실에서 새 음악을 만드는데 열중해 왔으며,
              많은 솔로 앨범과 넥스트 신곡이 이곳에서 탄생했습니다.
            </p>
            <p>
              이 공간은 시민들에게 2023.12.28.까지 무료로 개방하였고,
              방문객수 감소 등으로 2024년부터 운영을 종료하였습니다.
              그러나 기존 작업실 사진과 영상은 방문객을 위해 남겨놓으니
              둘러보시기 바랍니다.
            </p>
          </div>
        </div>

        <div className={styles.workspace}>
          <div className={styles.desc}>
            <p>
              해철이 형과 예전보다 더 가까워져서 분당에 있는 작업실에서 음악도 만들고 그랬다.
              해철이 형은 내게 '만년 소년' 같은 존재였다. 음악에 대한 열정이라는 측면에 있어서
              정말 화수분 같은 사람이라고 할까. 그 작고 조그만 작업실에서 형은 정말로 집에 안 가고
              며칠 밤을 새서 작업에 매달렸다.
            </p>
            <span className={styles.writer}>
              윤도현
              <span>('신해철 아카이브 함께 만들어요'에서...)</span>
            </span>
          </div>
          <div className={styles.thumb}>
            <span className={styles.tit}>서재</span>
            <img src="/workplace-assets/img_ws3.jpg" alt="서재 내부사진" />
          </div>
          <div className={styles.thumb}>
            <span className={styles.tit}>책장과 도서들</span>
            <img src="/workplace-assets/img_ws4.jpg" alt="서재 책장과 도서들" />
          </div>
        </div>

        <div className={styles.workspace}>
          <div className={styles.thumb}>
            <span className={styles.tit}>레코드실</span>
            <img src="/workplace-assets/img_ws5.jpg" alt="레코드실 내부사진1" />
          </div>
          <div className={styles.desc}>
            <p>
              어찌 보면 대단한 뮤지션 한 분이 6년간 변변찮은 지하 작업실에만 계셨잖아요.
              외롭게 지내다 가신 겁니다. 최근 새 앨범을 발표하고 활발히 활동하기 전까지
              사람들을 잘 만나지 않았어요. 대신 형은 창작의 고통을 짊어지고 살았습니다.
              영감을 얻기 위한 방법이 뮤지션마다 다르지만 해철 형은 삶의 모든 순간이
              음악을 만들기 위한 고뇌의 연속이었습니다.
            </p>
            <span className={styles.writer}>
              넥스트 보컬 이현섭
              <span>('故신해철, 그대에게'에서...)</span>
            </span>
          </div>
          <div className={styles.thumb}>
            <span className={styles.tit}>레코드실</span>
            <img src="/workplace-assets/img_ws6.jpg" alt="레코드실 내부사진2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkPlace;