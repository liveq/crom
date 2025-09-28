/**
 * 추모 메시지 서비스
 * Firestore와 연동하여 메시지 CRUD 처리
 */

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  startAfter,
  DocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MemorialMessage {
  id?: string;
  author: string;
  message: string;
  password?: string; // 비밀번호 (실제로는 해시 처리 필요)
  createdAt: Date;
  userId?: string;
  userEmail?: string;
  isAnonymous: boolean;
  isApproved?: boolean; // Firebase에서 온 메시지
  approved?: boolean; // Legacy 메시지 호환성을 위해 추가
  isRejected?: boolean;
  rejectionReason?: string;
  likes: number;
  reportCount?: number;
  reports?: number; // Legacy 메시지 호환성을 위해 추가
  isLegacy?: boolean; // 성남시 데이터 여부
}

const COLLECTION_NAME = 'memorial_messages';

/**
 * 비밀번호 검증 (실제로는 서버에서 처리해야 함)
 */
export const verifyMessagePassword = async (
  messageId: string,
  password: string
): Promise<boolean> => {
  try {
    // TODO: 실제 구현 시 서버에서 해시된 비밀번호 비교
    // 임시로 true 반환
    console.log('Verifying password for message:', messageId);
    return true;
  } catch (error) {
    console.error('비밀번호 검증 실패:', error);
    return false;
  }
};

/**
 * 메시지 삭제 (레거시 메시지는 숨김 처리)
 */
export const deleteMessage = async (
  messageId: string,
  isLegacy: boolean = false
): Promise<void> => {
  try {
    if (isLegacy) {
      // 레거시 메시지는 삭제하지 않고 isApproved를 false로 변경
      const docRef = doc(db, COLLECTION_NAME, messageId);
      await updateDoc(docRef, {
        isApproved: false,
        deletedAt: Timestamp.now(),
        deletedBy: 'admin'
      });
    } else {
      // 일반 메시지는 실제 삭제
      await deleteDoc(doc(db, COLLECTION_NAME, messageId));
    }
  } catch (error) {
    console.error('메시지 삭제 실패:', error);
    throw error;
  }
};

/**
 * 메시지 수정
 */
export const updateMessage = async (
  messageId: string,
  updates: Partial<MemorialMessage>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, messageId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('메시지 수정 실패:', error);
    throw error;
  }
};

/**
 * 메시지 생성
 */
export const createMessage = async (
  message: Omit<MemorialMessage, 'id' | 'createdAt' | 'likes' | 'isApproved'> & { password?: string }
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...message,
      createdAt: Timestamp.now(),
      likes: 0,
      isApproved: false, // 기본적으로 승인 대기
      reportCount: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('메시지 생성 실패:', error);
    throw error;
  }
};

/**
 * 승인된 메시지 목록 조회
 */
export const getApprovedMessages = async (
  limitCount = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ messages: MemorialMessage[]; lastDoc: DocumentSnapshot | null }> => {
  console.log('🔍 getApprovedMessages 시작:', { limitCount, hasLastDoc: !!lastDoc });

  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }

    console.log('📡 Firebase 쿼리 실행 중...');
    const snapshot = await getDocs(q);

    console.log('📥 Firebase 응답 받음:', {
      docsCount: snapshot.docs.length,
      isEmpty: snapshot.empty
    });

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as MemorialMessage[];

    const lastDocument = snapshot.docs[snapshot.docs.length - 1] || null;

    console.log('✅ Firebase 메시지 처리 완료:', {
      messagesCount: messages.length,
      hasLastDoc: !!lastDocument
    });

    return { messages, lastDoc: lastDocument };
  } catch (error: any) {
    console.error('❌ 메시지 조회 실패:', {
      error: error.message,
      code: error.code,
      details: error
    });

    // Firebase 권한 에러 구체적 처리
    if (error.code === 'permission-denied') {
      console.warn('⚠️ Firebase 권한이 없습니다. Legacy 메시지만 표시됩니다.');
    } else if (error.code === 'unavailable') {
      console.warn('⚠️ Firebase 서비스를 사용할 수 없습니다. Legacy 메시지만 표시됩니다.');
    } else if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
      console.warn('⚠️ Firestore 인덱스가 필요하거나 규칙 문제입니다.');
    }

    return { messages: [], lastDoc: null };
  }
};

/**
 * 대기중인 메시지 목록 조회 (관리자용)
 */
export const getPendingMessages = async (): Promise<MemorialMessage[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isApproved', '==', false),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as MemorialMessage[];
  } catch (error) {
    console.error('대기 메시지 조회 실패:', error);
    return [];
  }
};

/**
 * 메시지 승인 (관리자용)
 */
export const approveMessage = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, COLLECTION_NAME, messageId);
    await updateDoc(messageRef, {
      isApproved: true,
      approvedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('메시지 승인 실패:', error);
    throw error;
  }
};

/**
 * 좋아요 증가
 */
export const likeMessage = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, COLLECTION_NAME, messageId);
    const snapshot = await getDocs(query(collection(db, COLLECTION_NAME), where('__name__', '==', messageId)));

    if (!snapshot.empty) {
      const currentLikes = snapshot.docs[0].data().likes || 0;
      await updateDoc(messageRef, {
        likes: currentLikes + 1
      });
    }
  } catch (error) {
    console.error('좋아요 실패:', error);
    throw error;
  }
};

/**
 * 메시지 신고
 */
export const reportMessage = async (messageId: string, reason?: string): Promise<void> => {
  try {
    const messageRef = doc(db, COLLECTION_NAME, messageId);
    const snapshot = await getDocs(query(collection(db, COLLECTION_NAME), where('__name__', '==', messageId)));

    if (!snapshot.empty) {
      const currentReports = snapshot.docs[0].data().reportCount || 0;
      await updateDoc(messageRef, {
        reportCount: currentReports + 1,
        lastReported: serverTimestamp()
      });

      // 신고 내용을 별도 컬렉션에 저장 (관리자가 확인할 수 있도록)
      if (reason) {
        const reportData = {
          messageId,
          reason,
          reportedAt: serverTimestamp(),
          status: 'pending' // pending, reviewed, resolved
        };

        await addDoc(collection(db, 'reports'), reportData);
      }

      // 신고가 5회 이상이면 자동으로 비승인 처리
      if (currentReports + 1 >= 5) {
        await updateDoc(messageRef, {
          isApproved: false
        });
      }
    }
  } catch (error) {
    console.error('신고 실패:', error);
    throw error;
  }
};

/**
 * 메시지 거부 (관리자용)
 */
export const rejectMessage = async (messageId: string, reason: string): Promise<void> => {
  try {
    const messageRef = doc(db, COLLECTION_NAME, messageId);
    await updateDoc(messageRef, {
      isApproved: false,
      isRejected: true,
      rejectionReason: reason,
      rejectedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('메시지 거부 실패:', error);
    throw error;
  }
};

/**
 * 모든 메시지 조회 (관리자용)
 */
export const getAllMessages = async (
  limitCount = 100,
  lastDoc?: DocumentSnapshot
): Promise<{ messages: MemorialMessage[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as MemorialMessage[];

    const lastDocument = snapshot.docs[snapshot.docs.length - 1] || null;

    return { messages, lastDoc: lastDocument };
  } catch (error) {
    console.error('메시지 조회 실패:', error);
    return { messages: [], lastDoc: null };
  }
};