/**
 * 관리자 패널 컴포넌트
 * 추모 메시지 관리 및 사이트 통계
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllMessages,
  approveMessage,
  rejectMessage,
  deleteMessage,
  type MemorialMessage
} from '../../services/memorialService';
import styles from './AdminPanel.module.css';
import type { DocumentSnapshot } from 'firebase/firestore';

const ADMIN_EMAIL = 'admin@crom-memorial.com'; // 실제 관리자 이메일로 변경 필요

const AdminPanel: React.FC = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MemorialMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MemorialMessage[]>([]);
  const [currentView, setCurrentView] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // 사용하지 않는 변수들 제거를 위한 주석 처리
  void lastDoc;
  void setLastDoc;
  void hasMore;
  void setHasMore;
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10;

  // 통계
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    reported: 0
  });

  // 관리자 확인
  useEffect(() => {
    if (user) {
      // 실제로는 Firebase Admin SDK나 Custom Claims를 사용해야 함
      // 여기서는 간단히 이메일로 확인
      setIsAdmin(user.email === ADMIN_EMAIL || user.email === 'tlawlgns59@gmail.com');
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  }, [user]);

  // 메시지 로드
  const loadMessages = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      const { messages: allMessages } = await getAllMessages(1000); // 모든 메시지 로드
      setMessages(allMessages);

      // 통계 계산
      const stats = {
        total: allMessages.length,
        pending: allMessages.filter(m => !m.isApproved && !m.isRejected).length,
        approved: allMessages.filter(m => m.isApproved).length,
        rejected: allMessages.filter(m => m.isRejected).length,
        reported: allMessages.filter(m => (m.reportCount || 0) > 0).length
      };
      setStats(stats);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 메시지 필터링
  useEffect(() => {
    let filtered = messages;

    switch (currentView) {
      case 'pending':
        filtered = messages.filter(m => !m.isApproved && !m.isRejected);
        break;
      case 'approved':
        filtered = messages.filter(m => m.isApproved);
        break;
      case 'rejected':
        filtered = messages.filter(m => m.isRejected);
        break;
    }

    setFilteredMessages(filtered);
    setCurrentPage(1);
  }, [messages, currentView]);

  // 관리자 로그인 시 메시지 로드
  useEffect(() => {
    if (isAdmin) {
      loadMessages();
    }
  }, [isAdmin]);

  // 메시지 승인
  const handleApprove = async (messageId: string) => {
    if (!messageId) return;

    try {
      await approveMessage(messageId);
      await loadMessages(); // 목록 새로고침
      alert('메시지가 승인되었습니다.');
    } catch (error) {
      console.error('승인 실패:', error);
      alert('승인 처리에 실패했습니다.');
    }
  };

  // 메시지 거부
  const handleReject = async (messageId: string) => {
    if (!messageId) return;

    const reason = prompt('거부 사유를 입력해주세요:');
    if (!reason) return;

    try {
      await rejectMessage(messageId, reason);
      await loadMessages();
      alert('메시지가 거부되었습니다.');
    } catch (error) {
      console.error('거부 실패:', error);
      alert('거부 처리에 실패했습니다.');
    }
  };

  // 메시지 삭제
  const handleDelete = async (messageId: string) => {
    if (!messageId) return;

    if (!confirm('정말로 이 메시지를 삭제하시겠습니까?')) return;

    try {
      await deleteMessage(messageId);
      await loadMessages();
      alert('메시지가 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 처리에 실패했습니다.');
    }
  };

  // 메시지 확장/축소
  const toggleExpand = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  // 페이지네이션
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = filteredMessages.slice(startIndex, endIndex);

  // 로그인 화면
  if (!user || !isAdmin) {
    return (
      <section className={styles.adminPanel}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>관리자 패널</h1>
            <p className={styles.subtitle}>관리자만 접근 가능한 페이지입니다</p>
          </div>

          {loading ? (
            <div className={styles.loading}>로딩중...</div>
          ) : (
            <div className={styles.loginForm}>
              <h2 className={styles.loginTitle}>관리자 로그인</h2>
              {user && !isAdmin && (
                <p className={styles.error}>관리자 권한이 없습니다.</p>
              )}
              <button
                className={styles.loginButton}
                onClick={signInWithGoogle}
              >
                Google로 로그인
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // 관리자 대시보드
  return (
    <section className={styles.adminPanel}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>관리자 대시보드</h1>
          <p className={styles.subtitle}>추모 메시지 관리 시스템</p>
        </div>

        <div className={styles.dashboard}>
          {/* 사이드바 */}
          <aside className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>메뉴</h3>
            <ul className={styles.sidebarMenu}>
              <li className={styles.menuItem}>
                <button
                  className={`${styles.menuButton} ${currentView === 'pending' ? styles.active : ''}`}
                  onClick={() => setCurrentView('pending')}
                >
                  대기중 ({stats.pending})
                </button>
              </li>
              <li className={styles.menuItem}>
                <button
                  className={`${styles.menuButton} ${currentView === 'approved' ? styles.active : ''}`}
                  onClick={() => setCurrentView('approved')}
                >
                  승인됨 ({stats.approved})
                </button>
              </li>
              <li className={styles.menuItem}>
                <button
                  className={`${styles.menuButton} ${currentView === 'rejected' ? styles.active : ''}`}
                  onClick={() => setCurrentView('rejected')}
                >
                  거부됨 ({stats.rejected})
                </button>
              </li>
              <li className={styles.menuItem}>
                <button
                  className={`${styles.menuButton} ${currentView === 'all' ? styles.active : ''}`}
                  onClick={() => setCurrentView('all')}
                >
                  전체 ({stats.total})
                </button>
              </li>
            </ul>
            <button className={styles.logoutButton} onClick={logout}>
              로그아웃
            </button>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className={styles.mainContent}>
            <div className={styles.contentHeader}>
              <h2 className={styles.contentTitle}>
                {currentView === 'pending' && '승인 대기 메시지'}
                {currentView === 'approved' && '승인된 메시지'}
                {currentView === 'rejected' && '거부된 메시지'}
                {currentView === 'all' && '전체 메시지'}
              </h2>
              <button onClick={loadMessages}>새로고침</button>
            </div>

            {/* 통계 */}
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>전체 메시지</p>
                <p className={styles.statValue}>{stats.total}</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>대기중</p>
                <p className={styles.statValue}>{stats.pending}</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>승인됨</p>
                <p className={styles.statValue}>{stats.approved}</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>신고됨</p>
                <p className={styles.statValue}>{stats.reported}</p>
              </div>
            </div>

            {/* 메시지 테이블 */}
            {loading ? (
              <div className={styles.loading}>로딩중...</div>
            ) : (
              <>
                <table className={styles.messageTable}>
                  <thead>
                    <tr>
                      <th>작성자</th>
                      <th>메시지</th>
                      <th>날짜</th>
                      <th>상태</th>
                      <th>신고</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMessages.map((msg) => (
                      <tr key={msg.id}>
                        <td>{msg.author}</td>
                        <td>
                          <div className={expandedMessages.has(msg.id!) ? styles.messageFull : styles.messagePreview}>
                            {msg.message}
                          </div>
                          {msg.message.length > 100 && (
                            <button
                              className={styles.expandButton}
                              onClick={() => toggleExpand(msg.id!)}
                            >
                              {expandedMessages.has(msg.id!) ? '접기' : '더보기'}
                            </button>
                          )}
                        </td>
                        <td>{msg.createdAt.toLocaleDateString('ko-KR')}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${
                            msg.isApproved ? styles.approved :
                            msg.isRejected ? styles.rejected :
                            styles.pending
                          }`}>
                            {msg.isApproved ? '승인' : msg.isRejected ? '거부' : '대기'}
                          </span>
                        </td>
                        <td>{msg.reportCount || 0}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            {!msg.isApproved && !msg.isRejected && (
                              <>
                                <button
                                  className={styles.approveButton}
                                  onClick={() => handleApprove(msg.id!)}
                                >
                                  승인
                                </button>
                                <button
                                  className={styles.rejectButton}
                                  onClick={() => handleReject(msg.id!)}
                                >
                                  거부
                                </button>
                              </>
                            )}
                            <button
                              className={styles.deleteButton}
                              onClick={() => handleDelete(msg.id!)}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageButton}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      이전
                    </button>
                    <span className={styles.pageInfo}>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      className={styles.pageButton}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;