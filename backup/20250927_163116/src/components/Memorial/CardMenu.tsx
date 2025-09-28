import React, { useState, useRef, useEffect } from 'react';
import styles from './CardMenu.module.css';

interface CardMenuProps {
  messageId: string;
  isLegacy?: boolean;
  isAdmin?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
}

const CardMenu: React.FC<CardMenuProps> = ({
  messageId,
  isLegacy = false,
  isAdmin = false,
  onEdit,
  onDelete,
  onReport
}) => {
  // 관리자 마스터 비밀번호 (환경변수에서 읽기)
  const ADMIN_MASTER_PASSWORD = import.meta.env.VITE_ADMIN_MASTER_PASSWORD || 'admin1234';
  const [showMenu, setShowMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEditClick = () => {
    setActionType('edit');
    setShowPasswordModal(true);
    setShowMenu(false);
  };

  const handleDeleteClick = () => {
    setActionType('delete');
    setShowPasswordModal(true);
    setShowMenu(false);
  };

  const handleReportClick = () => {
    if (window.confirm('이 메시지를 레포트하시겠습니까?\n부적절한 내용이 포함된 경우 관리자가 검토합니다.')) {
      onReport();
    }
    setShowMenu(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 4) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    // 레거시 메시지 + 관리자인 경우 마스터 비밀번호 체크
    if (isLegacy && isAdmin) {
      if (password !== ADMIN_MASTER_PASSWORD) {
        setPasswordError('관리자 비밀번호가 올바르지 않습니다.');
        return;
      }
    } else {
      // 일반 메시지는 실제 서버 검증 필요
      // TODO: 실제 비밀번호 검증 로직 구현 필요
      // const isValid = await verifyPassword(messageId, password);
    }

    // 비밀번호 검증 통과 시 액션 실행
    if (actionType === 'edit') {
      onEdit();
    } else if (actionType === 'delete') {
      if (window.confirm('정말로 이 메시지를 삭제하시겠습니까?')) {
        onDelete();
      }
    }

    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
    setActionType(null);
  };

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <button
        className={styles.menuButton}
        onClick={handleMenuClick}
        aria-label="메뉴 열기"
      >
        <span className={styles.menuIcon}>⋯</span>
      </button>

      {showMenu && (
        <div className={styles.menuDropdown}>
          {/* 레거시 메시지는 관리자만 수정/삭제 가능 */}
          {(!isLegacy || isAdmin) && (
            <>
              <button className={styles.menuItem} onClick={handleEditClick}>
                수정
              </button>
              <button className={styles.menuItem} onClick={handleDeleteClick}>
                삭제
              </button>
            </>
          )}
          {/* 레포트는 모든 사용자 가능 */}
          <button className={`${styles.menuItem} ${styles.reportItem}`} onClick={handleReportClick}>
            레포트
          </button>
        </div>
      )}

      {showPasswordModal && (
        <div className={styles.passwordOverlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.passwordModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.passwordTitle}>
              {actionType === 'edit' ? '메시지 수정' : '메시지 삭제'}
            </h3>
            <p className={styles.passwordDesc}>
              {isLegacy && isAdmin
                ? '관리자 비밀번호를 입력해주세요.'
                : '작성 시 입력한 비밀번호를 입력해주세요.'}
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                className={styles.passwordInput}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                maxLength={20}
              />
              {passwordError && (
                <p className={styles.errorMessage}>{passwordError}</p>
              )}
              <div className={styles.passwordButtons}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPasswordError('');
                    setActionType(null);
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={styles.confirmButton}
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardMenu;