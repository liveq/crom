/**
 * 파싱된 성남시 추모 메시지를 Firebase Firestore로 이전
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES modules에서 __dirname 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 메시지 이전 함수
async function migrateMessages() {
  try {
    console.log('Firebase 연결 중...');

    // 파싱된 메시지 읽기
    const messagesPath = path.join(__dirname, '../../backup/cromst-seongnam/parsed_messages.json');
    const messagesData = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));

    console.log(`${messagesData.length}개의 메시지를 Firebase로 이전 시작...`);

    // memorial_messages 컬렉션 참조
    const messagesCollection = collection(db, 'memorial_messages');

    // 기존 메시지 확인 (중복 방지)
    const existingDocs = await getDocs(messagesCollection);
    const existingContents = new Set();

    existingDocs.forEach(doc => {
      const data = doc.data();
      if (data.content) {
        existingContents.add(data.content.substring(0, 50));
      }
    });

    console.log(`기존 메시지 ${existingContents.size}개 확인됨`);

    let addedCount = 0;
    let skippedCount = 0;

    // 각 메시지를 Firestore에 추가
    for (const message of messagesData) {
      const contentKey = message.content.substring(0, 50);

      // 중복 체크
      if (existingContents.has(contentKey)) {
        console.log(`[중복] ${message.writer}의 메시지 건너뜀`);
        skippedCount++;
        continue;
      }

      // Firestore 문서 형식으로 변환
      const docData = {
        author: message.writer || '익명',
        content: message.content,
        createdAt: new Date(message.date || new Date()),
        isApproved: true, // 성남시 사이트의 메시지는 이미 승인된 것으로 처리
        isDeleted: false,
        likes: 0,
        source: message.source || 'seongnam_backup',
        originalSite: message.originalSite || 'cromst.seongnam.go.kr',
        migratedAt: new Date(),
        // 익명 사용자로 처리
        userId: null,
        userEmail: null,
        isAnonymous: true
      };

      try {
        const docRef = await addDoc(messagesCollection, docData);
        console.log(`✅ ${message.writer}의 메시지 추가됨 (ID: ${docRef.id})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ ${message.writer}의 메시지 추가 실패:`, error.message);
      }
    }

    console.log('\n=== 마이그레이션 완료 ===');
    console.log(`✅ 성공: ${addedCount}개`);
    console.log(`⏭️ 중복 건너뜀: ${skippedCount}개`);
    console.log(`📊 총 DB 메시지: ${existingContents.size + addedCount}개`);

    // 마이그레이션 로그 저장
    const logData = {
      timestamp: new Date().toISOString(),
      totalMessages: messagesData.length,
      added: addedCount,
      skipped: skippedCount,
      totalInDb: existingContents.size + addedCount
    };

    const logPath = path.join(__dirname, '../../backup/cromst-seongnam/migration_log.json');
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    console.log(`\n로그 저장: ${logPath}`);

  } catch (error) {
    console.error('마이그레이션 실패:', error);
  }

  process.exit(0);
}

// 실행
console.log('=== 성남시 추모 메시지 Firebase 마이그레이션 ===\n');
migrateMessages();