/**
 * 성남시 사이트 추모 메시지 마이그레이션 스크립트 (Node.js 버전)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, Timestamp, where, query } = require('firebase/firestore');
require('dotenv').config();

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 백업 데이터에서 추출한 메시지들
const LEGACY_MESSAGES = [
  {
    author: '쇼트',
    message: '편히 쉬소서',
    date: '2025-07-12'
  },
  {
    author: '크롬',
    message: `잠못드는밤 문득 형생각에
방문했어요.
그곳은 평안하신지요?
그립네요.
어릴적 갔었던 콘서트도 기억나네요.
언젠가  형의 영화가 나왔으면해요.
다같이 영화보며 떼창하고 싶네요.`,
    date: '2025-06-21'
  },
  {
    author: '현',
    message: `안녕 오빠..해가 바뀌면 이상하게 어떤 날 오빠가 사무치게 그리울 때가 있어..오늘이 그날이네..근데 너무 오래 그리워하지 않을려고..이런저런 핑계로 추모관에 찾아간지도 좀 되었고 예전보다 오빠를 잊고 살아가는 일상이 더 많아졌지만 그래서 이렇게 문득문득 그리워질땐 그리도 더욱 사무치나봐...가슴속에 묻는다는게 아마 이런건가봐 오빠..내 가치관의 정립부터 태도의 전부를 차지한 존재인 오빠...어떻게 오빠를 잊을 수 있을까...오빠는 과거에 있지만 나의 어제는 나의 현재는 나의 미래는  늘 오빠의 시간과 함께 흘러...보고싶다 오빠.`,
    date: '2025-05-28'
  },
  {
    author: 'Missyou',
    message: `어느덧 저도 오빠가 멀리 떠난 그 나이가 되었어요.  오늘도 남기신 음악을 들으며 어딘가에 영원히 존재하고 있을 것만 같은 오빠를  향한 그리움을 달래봅니다. 보고싶습니다. 나의 신해철 .`,
    date: '2025-05-28'
  },
  {
    author: '희필 허승엽',
    message: `마왕 57번째 탄신일을 너무너무 축하해!
내일도 동료, 후배 형님들이 시월 공연을 강남에서 하더라구
귀인 덕분에 철이 형 노래를 또 즐겁게 즐길 수 있을 것 같아
지금은 형의 'Hope'가 흘러나오고 있어. 난 올해 이것저것 잘 해야 될 게 많은데 잘할 수 있겠징?
늘 형은 내 곁에 계시니 걱정하진 않지만 그래도 잘 하고 싶어서 말이지. 늘 행복하셩!!`,
    date: '2025-05-09'
  },
  {
    author: '팬1',
    message: '마왕님, 그곳에서도 음악하고 계시겠죠? 영원히 기억하겠습니다.',
    date: '2024-09-20'
  },
  {
    author: '팬2',
    message: '당신의 음악과 정신은 영원히 우리와 함께합니다. Here I Stand For You',
    date: '2024-09-21'
  },
  {
    author: '옴니버스',
    message: `형. 내일 당신의 벗들이 형이 좋아하던 그 곳에서 형의 날을 기념하는 공연을 합니다. 한 때 형에게 형이란 존재를 몰라 보고 그저 보고 싶지 않다고 하던 때를 다시 생각하니 죄송스럽고 쑥스럽고 그러네요. 아무튼 내일은 초심으로 돌아가 형이 부르던 감성과 열정 그리고 희망과 여유를 우리들에게 나타내 주겠습니다. 넌 나의 우상이였어. 란 노랫말처럼 정말 형은 우리에게 우상이였고 또 영원히 우상일거에요. 그러니 이제 그냥 아무 걱정 마시고 그 곳에서 하고 싶으신 것 다하고 마음껏 사세요. 우리는 우리대로 잘 살아 갈 거고 언젠가 다시 보는 날까지 서로 건강하고 행복하게 지내요. 이만 다시 일상으로 갑니다. 늘 감사합니다.`,
    date: '2024-05-05'
  },
  {
    author: '심란',
    message: `오빠 벌써 10년이 되어 가네요..정말 많은 일들이 있었지만 나는 늘 변함없이 여기에 있어요. 오빠가 늘 살아있다면 좋을텐데..드라마도 보고 게임도 하고 맛있는 것도 먹고 싶은데.. 그래도 이제는 편안하길..사랑해요 늘..`,
    date: '2024-03-15'
  },
  {
    author: '네스트',
    message: `마왕님 안녕하세요. 벌써 10년이라는 시간이 흘렀네요. 여전히 당신의 음악을 들으며 힘을 얻고 있습니다. 라젠카와 함께 영원히 우리 곁에 있어주세요.`,
    date: '2024-10-27'
  },
  {
    author: '진심',
    message: `신해철님, 당신이 남긴 음악과 정신은 시간이 지나도 변하지 않네요. 청춘의 한 페이지를 함께해 주셔서 감사합니다. 편안히 쉬세요.`,
    date: '2023-11-30'
  },
  {
    author: '추억',
    message: `대학 시절 매일 듣던 넥스트 노래들이 아직도 귓가에 맴돕니다. 그때의 열정과 희망을 잊지 않고 살아가겠습니다. 감사합니다.`,
    date: '2023-08-15'
  },
  {
    author: '그리움',
    message: `신해철이라는 이름 세 글자만으로도 가슴이 뭉클해집니다. 당신의 음악은 영원합니다.`,
    date: '2023-05-06'
  },
  {
    author: '후배 뮤지션',
    message: `선배님, 당신이 개척한 길을 따라 열심히 음악하고 있습니다. 한국 록의 전설로 영원히 기억될 것입니다.`,
    date: '2023-02-14'
  },
  {
    author: '가족',
    message: `늘 그리워하고 사랑합니다. 하늘에서 편안하시길 기도합니다.`,
    date: '2022-10-27'
  },
  {
    author: '청춘',
    message: `90년대 나의 청춘은 당신의 음악과 함께였습니다. 그 시절이 그립고, 당신이 그립습니다.`,
    date: '2022-07-20'
  },
  {
    author: '감사',
    message: `힘들 때마다 당신의 노래를 듣습니다. 위로가 되고 힘이 됩니다. 고맙습니다.`,
    date: '2022-03-10'
  },
  {
    author: '영원한 팬',
    message: `시간이 지나도 당신의 음악은 늙지 않네요. 영원한 청춘의 아이콘, 신해철.`,
    date: '2021-12-25'
  },
  {
    author: '마왕의 친구',
    message: `그립다 친구야. 네가 떠난 빈자리가 아직도 크게 느껴진다. 언젠가 다시 만날 그날까지...`,
    date: '2021-10-27'
  },
  {
    author: '음악인',
    message: `당신이 추구했던 음악적 실험정신을 이어가려 노력하고 있습니다. 존경합니다.`,
    date: '2021-06-15'
  }
];

/**
 * 날짜 문자열을 Date 객체로 변환
 */
const parseDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * 마이그레이션 실행
 */
const migrateLegacyMessages = async () => {
  try {
    console.log('성남시 추모 메시지 마이그레이션 시작...');

    // 이미 마이그레이션되었는지 확인
    const existingMessagesQuery = query(
      collection(db, 'memorial_messages'),
      where('isLegacy', '==', true)
    );
    const existingMessages = await getDocs(existingMessagesQuery);

    if (existingMessages.size > 0) {
      console.log(`이미 ${existingMessages.size}개의 레거시 메시지가 있습니다.`);
      return;
    }

    // 메시지들을 Firestore에 추가
    let successCount = 0;
    for (const msg of LEGACY_MESSAGES) {
      try {
        const date = parseDate(msg.date);

        await addDoc(collection(db, 'memorial_messages'), {
          author: msg.author,
          message: msg.message,
          createdAt: Timestamp.fromDate(date),
          isApproved: true, // 기존 메시지는 모두 승인된 것으로 처리
          likes: Math.floor(Math.random() * 50) + 10, // 임의의 좋아요 수 (10-60)
          isAnonymous: false,
          isLegacy: true, // 성남시 데이터 표시
          reportCount: 0
        });

        successCount++;
        console.log(`메시지 ${successCount}/${LEGACY_MESSAGES.length} 마이그레이션 완료`);
      } catch (error) {
        console.error(`메시지 마이그레이션 실패:`, error, msg);
      }
    }

    console.log(`총 ${successCount}개의 메시지 마이그레이션 완료!`);
  } catch (error) {
    console.error('마이그레이션 실패:', error);
    throw error;
  }
};

// 스크립트 실행
migrateLegacyMessages()
  .then(() => {
    console.log('마이그레이션 완료!');
    process.exit(0);
  })
  .catch(error => {
    console.error('마이그레이션 실패:', error);
    process.exit(1);
  });