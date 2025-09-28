/**
 * 편지 작성 모달 컴포넌트
 * 카드 그리드와 동일한 크기의 모달로 편지 작성
 */

import React, { useState, useRef, useEffect } from 'react';
import styles from './LetterModal.module.css';

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (author: string, message: string, password: string) => Promise<void>;
  submitting: boolean;
  error?: string;
  editMode?: boolean;
  initialData?: {
    author: string;
    message: string;
  };
}

const LetterModal: React.FC<LetterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  error
}) => {
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const compositionEndTimeRef = useRef<number>(0); // compositionEnd 타임스탬프
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  // 텍스트 입력 시 자동 스크롤
  useEffect(() => {
    if (textareaRef.current && message.length > 100) {
      // 내용이 길어지면 textarea 끝으로 스크롤
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;

      // 모달 내용도 스크롤
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = modalContentRef.current.scrollHeight;
      }
    }
  }, [message]);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setAuthor('');
      setMessage('');
      setPassword('');
      setLocalError('');
      setShowConfirmDialog(false);
    }
  }, [isOpen]);

  // ESC 키 핸들러 - 단일 이벤트 리스너로 통합
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        // compositionEnd 직후 100ms 이내면 무시
        const now = Date.now();
        if (now - compositionEndTimeRef.current < 100) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // 한글 조합 중이면 무시
        if (isComposing) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (showConfirmDialog) {
          // 확인 다이얼로그가 열려있으면 닫기
          setShowConfirmDialog(false);
          // textarea로 포커스 이동
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              // 커서를 텍스트 끝으로 이동
              const len = textareaRef.current.value.length;
              textareaRef.current.setSelectionRange(len, len);
            }
          }, 100);
        } else {
          // 모달 닫기 시도
          handleClose();
        }
      }
    };

    // 단일 이벤트 리스너만 사용 (capture 단계)
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [isOpen, showConfirmDialog, message, author, isComposing]);

  // 확인 다이얼로그 표시될 때 아니오 버튼에 포커스
  useEffect(() => {
    if (showConfirmDialog && noButtonRef.current) {
      setTimeout(() => noButtonRef.current?.focus(), 100);
    }
  }, [showConfirmDialog]);

  const handleClose = () => {
    // 내용이 있으면 확인
    if ((message.trim() || author.trim()) && !showConfirmDialog) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (author.length < 2 || author.length > 20) {
      setLocalError('이름은 2-20자로 입력해주세요.');
      return;
    }

    // 최소 글자수 제한 제거 - 추모의 양을 강제하지 않음
    if (message.length > 1000) {
      setLocalError('메시지는 1000자 이하로 입력해주세요.');
      return;
    }

    if (!password) {
      setLocalError('비밀번호를 입력해주세요.');
      return;
    }

    setLocalError('');

    try {
      await onSubmit(author, message, password);
      onClose();
    } catch (err) {
      // 에러는 상위 컴포넌트에서 처리
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>

        <div className={styles.modalContent} ref={modalContentRef}>
          <form onSubmit={handleSubmit} className={styles.letterForm}>
            <div className={styles.messageGroup}>
              <textarea
                id="message"
                ref={textareaRef}
                className={styles.messageTextarea}
                placeholder=""
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => {
                  setIsComposing(false);
                  compositionEndTimeRef.current = Date.now(); // 타임스탬프 기록
                }}
                maxLength={1000}
                required
                disabled={submitting}
                autoFocus
              />
              <span className={styles.charCount}>
                {message.length}/300
              </span>
            </div>

            <div className={styles.authorGroup}>
              <input
                id="author"
                type="text"
                className={styles.authorInput}
                placeholder="보내는 이"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => {
                  setIsComposing(false);
                  compositionEndTimeRef.current = Date.now(); // 타임스탬프 기록
                }}
                maxLength={20}
                required
                disabled={submitting}
              />
              <input
                id="password"
                type="password"
                className={styles.passwordInput}
                placeholder="비밀번호 (수정/삭제 시 필요)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={20}
                required
                disabled={submitting}
              />
            </div>

            {(localError || error) && (
              <p className={styles.errorMessage}>{localError || error}</p>
            )}

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={submitting}
              >
                닫기
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? '전송 중...' : '편지 보내기'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 확인 다이얼로그 */}
      {showConfirmDialog && (
        <div className={styles.confirmOverlay} onClick={(e) => e.stopPropagation()}>
          <div className={styles.confirmDialog}>
            <p className={styles.confirmMessage}>
              작성 중인 내용이 있습니다.
              <br />
              정말로 닫으시겠습니까?
            </p>
            <div className={styles.confirmButtons}>
              <button
                ref={noButtonRef}
                className={styles.confirmNoButton}
                onClick={() => {
                  setShowConfirmDialog(false);
                  // textarea로 포커스 이동
                  setTimeout(() => {
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                      // 커서를 텍스트 끝으로 이동
                      const len = textareaRef.current.value.length;
                      textareaRef.current.setSelectionRange(len, len);
                    }
                  }, 100);
                }}
                autoFocus
              >
                아니오
              </button>
              <button
                className={styles.confirmYesButton}
                onClick={handleConfirmClose}
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LetterModal;