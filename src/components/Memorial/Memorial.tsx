/**
 * Memorial 컴포넌트
 * 추모 메시지 작성 및 표시 섹션
 * 실시간 업데이트 및 모더레이션 지원
 */

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Memorial.module.css';
import type { MemorialMessage } from '../../types';

interface MemorialProps {
  messages?: MemorialMessage[];
  enableSubmission?: boolean;
  requireAuth?: boolean;
  maxMessageLength?: number;
  className?: string;
  onSubmit?: (message: Omit<MemorialMessage, 'id' | 'createdAt' | 'isApproved'>) => Promise<void>;
  onLike?: (messageId: string) => void;
}

const Memorial: React.FC<MemorialProps> = ({
  messages = [],
  enableSubmission = true,
  requireAuth = false,
  maxMessageLength = 500,
  className,
  onSubmit,
  onLike
}) => {
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    author: '',
    message: ''
  });

  // 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 표시할 메시지 목록 (승인된 것만)
  const [displayMessages, setDisplayMessages] = useState<MemorialMessage[]>([]);

  // 문자 수 카운터
  const characterCount = formData.message.length;

  useEffect(() => {
    // 승인된 메시지만 필터링하여 표시
    const approvedMessages = messages
      .filter(msg => msg.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setDisplayMessages(approvedMessages);
  }, [messages]);

  // 입력 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // 메시지 길이 제한
    if (name === 'message' && value.length > maxMessageLength) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.author.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      return;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      setSubmitStatus('idle');

      try {
        await onSubmit({
          author: formData.author.trim(),
          message: formData.message.trim(),
          likes: 0
        });

        // 성공 시 폼 초기화
        setFormData({ author: '', message: '' });
        setSubmitStatus('success');

        // 3초 후 상태 리셋
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('메시지 제출 실패:', error);
        setSubmitStatus('error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 좋아요 핸들러
  const handleLike = useCallback((messageId: string) => {
    if (onLike) {
      onLike(messageId);
    }
  }, [onLike]);

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return messageDate.toLocaleDateString('ko-KR');
    }
  };

  return (
    <section className={`${styles.memorial} ${className || ''}`}>
      <div className={styles.container}>
        {/* 섹션 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>추모 공간</h2>
          <p className={styles.sectionDescription}>
            마왕을 기억하는 당신의 마음을 전해주세요
          </p>
        </div>

        {/* 메시지 작성 폼 */}
        {enableSubmission && (
          <div className={styles.formSection}>
            {requireAuth && (
              <div className={styles.authNotice}>
                <p>메시지 작성을 위해 로그인이 필요합니다.</p>
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                  className={styles.input}
                  disabled={isSubmitting || requireAuth}
                  maxLength={50}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="추모 메시지를 남겨주세요..."
                  className={styles.textarea}
                  disabled={isSubmitting || requireAuth}
                  rows={4}
                  required
                />
                <div className={styles.charCount}>
                  <span className={characterCount > maxMessageLength * 0.9 ? styles.warning : ''}>
                    {characterCount}
                  </span>
                  / {maxMessageLength}
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || requireAuth}
                >
                  {isSubmitting ? '전송 중...' : '메시지 남기기'}
                </button>

                {/* 상태 메시지 */}
                {submitStatus === 'success' && (
                  <p className={styles.successMessage}>
                    메시지가 성공적으로 등록되었습니다. 검토 후 게시됩니다.
                  </p>
                )}
                {submitStatus === 'error' && (
                  <p className={styles.errorMessage}>
                    메시지 등록에 실패했습니다. 다시 시도해주세요.
                  </p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 메시지 목록 */}
        <div className={styles.messageList}>
          {displayMessages.length > 0 ? (
            displayMessages.map((msg) => (
              <article key={msg.id} className={styles.messageCard}>
                <div className={styles.messageHeader}>
                  <h4 className={styles.messageAuthor}>{msg.author}</h4>
                  <time className={styles.messageDate}>
                    {formatDate(msg.createdAt)}
                  </time>
                </div>

                <p className={styles.messageContent}>{msg.message}</p>

                <div className={styles.messageFooter}>
                  <button
                    className={styles.likeButton}
                    onClick={() => handleLike(msg.id)}
                    aria-label="좋아요"
                  >
                    <span className={styles.likeIcon}>♡</span>
                    {msg.likes && msg.likes > 0 && (
                      <span className={styles.likeCount}>{msg.likes}</span>
                    )}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>첫 번째 추모 메시지를 남겨주세요.</p>
            </div>
          )}
        </div>

        {/* 더보기 버튼 (추후 페이지네이션) */}
        {displayMessages.length >= 10 && (
          <div className={styles.loadMore}>
            <button className={styles.loadMoreButton}>
              더 많은 메시지 보기
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Memorial;