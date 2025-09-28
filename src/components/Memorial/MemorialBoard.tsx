/**
 * MemorialBoard 컴포넌트
 * 추모 메시지 게시판
 */

import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { MemorialMessage } from '../../types';
import styles from './MemorialBoard.module.css';
import backupMessages from '../../data/memorialMessages-final.json';

const MemorialBoard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allMessages, setAllMessages] = useState<MemorialMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [messagesPerPage, setMessagesPerPage] = useState(6); // 기본값 6

  // 반응형 메시지 개수 설정
  useEffect(() => {
    const handleResize = () => {
      const newMessagesPerPage = window.innerWidth <= 768 ? 1 :
                                window.innerWidth <= 1280 ? 4 : 6;

      if (messagesPerPage !== newMessagesPerPage) {
        console.log(`📱 화면 크기 변경: messagesPerPage ${messagesPerPage} → ${newMessagesPerPage}`);
        setMessagesPerPage(newMessagesPerPage);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [messagesPerPage]);

  // 페이지 관련 함수
  const goToFirstPage = () => {
    console.log(`🏠 첫 페이지로 이동: ${currentPage} → 1`);
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    const totalPages = Math.ceil(allMessages.length / messagesPerPage);
    console.log(`🏁 마지막 페이지로 이동: ${currentPage} → ${totalPages}`);
    setCurrentPage(totalPages);
  };

  const goToPrevPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    console.log(`◀️ 이전 페이지로 이동: ${currentPage} → ${newPage}`);
    setCurrentPage(newPage);
  };

  const goToNextPage = () => {
    const totalPages = Math.ceil(allMessages.length / messagesPerPage);
    const newPage = Math.min(totalPages, currentPage + 1);
    console.log(`▶️ 다음 페이지로 이동: ${currentPage} → ${newPage}`);
    setCurrentPage(newPage);
  };

  // 페이지가 범위를 벗어나면 조정
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(allMessages.length / messagesPerPage));
    if (currentPage > totalPages) {
      console.log(`⚠️ 현재 페이지(${currentPage})가 전체 페이지(${totalPages})보다 큼. 조정 필요.`);
      setCurrentPage(totalPages);
    }
  }, [allMessages.length, messagesPerPage, currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const newMessage = {
        author: author.trim() || '익명',
        message: message.trim(),
        timestamp: Timestamp.now(),
        createdAt: new Date().toISOString(),
        isLegacy: false
      };

      const docRef = await addDoc(collection(db, 'memorialMessages'), newMessage);
      console.log('✅ 메시지 저장 성공:', docRef.id);

      // 폼 초기화 및 숨기기
      setAuthor('');
      setMessage('');
      setShowForm(false);

      // 목록 새로고침
      loadMessages();
    } catch (error) {
      console.error('❌ 메시지 저장 실패:', error);
      alert('메시지 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadMessages = async () => {
    console.log('📥 Firebase에서 메시지 로드 시작...');
    setLoading(true);
    try {
      const q = query(
        collection(db, 'memorialMessages'),
        orderBy('timestamp', 'desc'),
        limit(500)
      );
      const querySnapshot = await getDocs(q);
      const messages: MemorialMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          author: data.author || '익명',
          message: data.message || '',
          timestamp: data.timestamp || Timestamp.now(),
          createdAt: data.createdAt || new Date().toISOString(),
          isLegacy: data.isLegacy || false
        } as MemorialMessage);
      });

      console.log(`✅ Firebase에서 ${messages.length}개 메시지 로드 완료`);

      // 시간순 정렬 (최신이 앞으로)
      messages.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });

      setAllMessages(messages);
    } catch (error) {
      console.error('❌ Firebase 메시지 로드 실패:', error);
      console.log('📦 백업 데이터 사용...');

      // Firebase 실패 시 백업 데이터 사용
      const fallbackMessages: MemorialMessage[] = backupMessages.map((msg: any) => {
        // author 필드가 이미 있고 '익명'이 아니면 그대로 사용
        if (msg.author && msg.author !== '익명') {
          return {
            id: msg.id,
            author: msg.author,
            message: msg.content || msg.message || '',
            timestamp: Timestamp.fromDate(new Date(msg.date || msg.createdAt)),
            createdAt: msg.date || msg.createdAt,
            isLegacy: msg.isLegacy !== false
          };
        }

        // author가 '익명'이거나 없는 경우에만 content에서 파싱 시도
        let cleanContent = msg.content || msg.message || '';
        let realAuthor = msg.author || '익명';
        let realDate = msg.date || msg.createdAt;

        // content 안에 포함된 작성자와 날짜 정보 추출 (탭과 공백 처리 개선)
        // 패턴: 메시지 내용 후 줄바꿈, 탭들, 작성자, 줄바꿈, 탭들, 날짜 형식
        const lines = cleanContent.split('\n');
        const filteredLines = lines.filter(line => line.trim() !== '');

        // 마지막 3줄이 작성자, 날짜, "글 삭제하기"인 패턴 찾기
        if (filteredLines.length >= 3) {
          const lastLine = filteredLines[filteredLines.length - 1];
          const secondLastLine = filteredLines[filteredLines.length - 2];
          const thirdLastLine = filteredLines[filteredLines.length - 3];

          // "글 삭제하기" 라인 제거
          if (lastLine.includes('글 삭제하기')) {
            // 날짜 패턴 체크 (YYYY-MM-DD 형식)
            if (/\d{4}-\d{2}-\d{2}/.test(secondLastLine)) {
              realDate = secondLastLine.trim();
              realAuthor = thirdLastLine.trim();

              // 메시지 내용만 추출 (작성자, 날짜, "글 삭제하기" 제외)
              const messageLines = filteredLines.slice(0, -3);
              cleanContent = messageLines.join('\n').trim();
            }
          }
        }

        // 작성자가 비어있으면 익명으로 설정
        if (!realAuthor || realAuthor === '') {
          realAuthor = '익명';
        }

        return {
          id: msg.id,
          author: realAuthor,
          message: cleanContent,
          timestamp: Timestamp.fromDate(new Date(realDate)),
          createdAt: realDate,
          isLegacy: msg.isLegacy !== false
        };
      });

      console.log(`📦 백업에서 ${fallbackMessages.length}개 메시지 로드`);
      setAllMessages(fallbackMessages);
    } finally {
      setLoading(false);
    }
  };

  // Memoized 페이지네이션 계산
  const paginationData = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(allMessages.length / messagesPerPage));
    const actualPage = Math.min(currentPage, totalPages);
    const start = (actualPage - 1) * messagesPerPage;
    const end = Math.min(start + messagesPerPage, allMessages.length);
    const messages = allMessages.slice(start, end);

    console.log(`📄 페이지네이션 재계산:
      전체: ${allMessages.length}개
      페이지당: ${messagesPerPage}개
      총 페이지: ${totalPages}
      현재 페이지: ${actualPage} (${currentPage} 요청됨)
      시작 인덱스: ${start}
      종료 인덱스: ${end}
      표시할 메시지: ${messages.length}개
      첫 메시지: ${messages[0]?.author || 'N/A'}`);

    return {
      totalPages,
      startIndex: start,
      endIndex: end,
      currentMessages: messages
    };
  }, [allMessages, currentPage, messagesPerPage]);

  const { totalPages, startIndex, endIndex, currentMessages } = paginationData;




  // 초기 로드
  useEffect(() => {
    loadMessages();
  }, []);

  // 페이지 상태 변경 추적 (useEffect)
  useEffect(() => {
    console.log(`📄 5단계 - 페이지 상태 변경 효과:`);
    console.log(`  - 페이지: ${currentPage}/${totalPages}`);
    console.log(`  - 표시할 메시지: ${currentMessages.length}개`);
    console.log(`  - 전체 데이터: ${allMessages.length}개`);
    if (currentMessages.length > 0) {
      console.log(`  - 실제 렌더링 첫 메시지:`, currentMessages[0].author, currentMessages[0].message.substring(0, 30));
    }
  }, [currentPage, totalPages, currentMessages.length, startIndex, endIndex, allMessages.length]);


  // 섹션 감지 및 스크롤 이벤트
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('memorial');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const now = Date.now();

      // 섹션이 뷰포트에 50% 이상 보일 때를 기준으로
      const isVisible = rect.top < viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.5;

    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 실행

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  return (
    <section id="memorial" className={styles.memorialBoard}>
      <div className={styles.container}>
        <h2 className={styles.title}>추모 메시지</h2>
        <p className={styles.subtitle}>신해철을 기억하는 마음을 전해주세요</p>

        {!showForm && (
          <div className={styles.buttonRow}>
            <button
              className={styles.writeButton}
              onClick={() => setShowForm(true)}
            >
              편지 쓰기
            </button>
          </div>
        )}

        {showForm && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="text"
              className={styles.input}
              placeholder="이름 (선택사항)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={50}
            />
            <textarea
              className={styles.textarea}
              placeholder="추모 메시지를 남겨주세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              required
            />
            {message.length > 0 && (
              <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#666' }}>
                {message.length} / 500
              </div>
            )}
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || !message.trim()}
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setShowForm(false);
                  setAuthor('');
                  setMessage('');
                }}
                disabled={isSubmitting}
              >
                취소
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className={styles.loading}>메시지를 불러오는 중...</div>
        ) : allMessages.length === 0 ? (
          <div className={styles.empty}>아직 작성된 메시지가 없습니다.</div>
        ) : (
          <>
            {/* 메시지 래퍼 */}
            <div className={styles.messageWrapper}>
              {/* 왼쪽 화살표 버튼 - 데스크톱만 */}
              {totalPages > 1 && window.innerWidth > 768 && (
                <button
                  className={`${styles.arrowButton} ${styles.prevArrow} ${currentPage > 1 ? styles.visible : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goToPrevPage();
                  }}
                  disabled={currentPage === 1}
                  aria-label="이전 페이지"
                >
                  ‹
                </button>
              )}

              {/* 메시지 그리드 */}
              <div className={`${styles.messageList}`}>
                {loading ? (
                  <div className={styles.loading}>메시지를 불러오는 중...</div>
                ) : currentMessages.length === 0 ? (
                  <div className={styles.empty}>표시할 메시지가 없습니다.</div>
                ) : (
                  currentMessages.map((msg) => {
                    // 날짜 처리 - createdAt이 이미 문자열 형식인 경우 그대로 사용
                    const displayDate = msg.timestamp?.toDate?.()
                      ? new Date(msg.timestamp.toDate()).toLocaleDateString('ko-KR')
                      : typeof msg.createdAt === 'string'
                        ? msg.createdAt
                        : msg.createdAt || '날짜 없음';

                    const displayAuthor = msg.author || '익명';
                    const cleanContent = msg.message || '';

                    return (
                      <div key={msg.id} className={styles.messageCard}>
                        <div className={styles.messageContent}>{cleanContent}</div>
                        <div className={styles.messageInfo}>
                          <span className={styles.date}>{displayDate}</span>
                          <span className={styles.author}>{displayAuthor}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* 페이지네이션 - 갤러리와 동일한 형식 */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {(() => {
                    const isMobile = window.innerWidth <= 768;
                    const pages = [];

                    // PC 모드: 추가 네비게이션 버튼
                    if (!isMobile) {
                      // << 10페이지 이전
                      pages.push(
                        <button
                          key="jump-prev-10"
                          className={styles.pageButton}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(Math.max(1, currentPage - 10));
                          }}
                          disabled={currentPage === 1}
                          title="10페이지 이전"
                        >
                          {'<<'}
                        </button>
                      );
                    } else {
                      // 모바일: << 버튼 (5페이지 이전)
                      pages.push(
                        <button
                          key="jump-prev"
                          className={styles.pageButton}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(Math.max(1, currentPage - 5));
                          }}
                          disabled={currentPage === 1}
                          title="5페이지 이전"
                        >
                          {'<<'}
                        </button>
                      );
                    }

                    // < 버튼
                    pages.push(
                      <button
                        key="prev"
                        className={styles.pageButton}
                        onClick={(e) => {
                          e.preventDefault();
                          goToPrevPage();
                        }}
                        disabled={currentPage === 1}
                      >
                        ‹
                      </button>
                    );

                    // 페이지 번호들
                    const maxVisible = isMobile ? 5 : 10;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

                    if (endPage - startPage < maxVisible - 1) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          className={`${styles.pageNumber} ${i === currentPage ? styles.active : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i);
                            if (!loading) {
                              setTimeout(() => {
                                document.getElementById('memorial')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 100);
                            }
                          }}
                        >
                          {i}
                        </button>
                      );
                    }

                    // > 버튼
                    pages.push(
                      <button
                        key="next"
                        className={styles.pageButton}
                        onClick={(e) => {
                          e.preventDefault();
                          goToNextPage();
                        }}
                        disabled={currentPage === totalPages}
                      >
                        ›
                      </button>
                    );

                    // PC 모드: 추가 네비게이션 버튼
                    if (!isMobile) {
                      // >> 10페이지 다음
                      pages.push(
                        <button
                          key="jump-next-10"
                          className={styles.pageButton}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(Math.min(totalPages, currentPage + 10));
                          }}
                          disabled={currentPage === totalPages}
                          title="10페이지 다음"
                        >
                          {'>>'}
                        </button>
                      );
                    } else {
                      // 모바일: >> 버튼 (5페이지 다음)
                      pages.push(
                        <button
                          key="jump-next"
                          className={styles.pageButton}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(Math.min(totalPages, currentPage + 5));
                          }}
                          disabled={currentPage === totalPages}
                          title="5페이지 다음"
                        >
                          {'>>'}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>
              )}

              {/* 오른쪽 화살표 버튼 - 데스크톱만 */}
              {totalPages > 1 && window.innerWidth > 768 && (
                <button
                  className={`${styles.arrowButton} ${styles.nextArrow} ${currentPage < totalPages ? styles.visible : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goToNextPage();
                  }}
                  disabled={currentPage === totalPages}
                  aria-label="다음 페이지"
                >
                  ›
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default MemorialBoard;