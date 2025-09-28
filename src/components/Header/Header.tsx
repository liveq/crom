/**
 * Header 컴포넌트
 * 네비게이션 바와 사이트 로고를 포함하는 헤더
 * 반응형 디자인 적용 (모바일 햄버거 메뉴 지원)
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import LoginModal from '../Auth/LoginModal';

interface HeaderProps {
  logo?: string;
  title?: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  logo,
  title = "CROM",
  className
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'carousel',
      label: '홈',
      children: [
        { id: 'carousel', label: '메인' },
        { id: 'hero', label: '영웅' }
      ]
    },
    { id: 'about', label: '프로필' },
    { id: 'discography', label: '디스코그래피' },
    {
      id: 'gallery',
      label: '갤러리',
      children: [
        { id: 'gallery', label: '미디어' },
        { id: 'street-gallery', label: '신해철 거리' }
      ]
    },
    { id: 'memorial', label: '편지' }
  ];

  React.useEffect(() => {
    return () => {
      if (dropdownTimeout.current) {
        clearTimeout(dropdownTimeout.current);
      }
    };
  }, []);

  // 데스크톱 드롭다운 메뉴 외부 클릭 시 닫기
  React.useEffect(() => {
    const handleDesktopMenuClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const target = event.target as HTMLElement;
        const navList = document.querySelector(`.${styles.navList}`);
        const dropdown = document.querySelector(`.${styles.dropdown}`);

        // 네비게이션 리스트와 드롭다운 메뉴 밖을 클릭했을 때만 닫기
        if (navList && !navList.contains(target) &&
            (!dropdown || !dropdown.contains(target))) {
          setActiveDropdown(null);
        }
      }
    };

    if (activeDropdown) {
      // 약간의 지연 후 이벤트 추가 (드롭다운이 열리자마자 닫히는 것 방지)
      setTimeout(() => {
        document.addEventListener('click', handleDesktopMenuClickOutside);
        document.addEventListener('touchstart', handleDesktopMenuClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('click', handleDesktopMenuClickOutside);
      document.removeEventListener('touchstart', handleDesktopMenuClickOutside);
    };
  }, [activeDropdown]);

  // 모바일 메뉴 외부 클릭 시 닫기
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as HTMLElement;
        const mobileMenu = document.querySelector(`.${styles.mobileMenu}`);
        const menuButton = document.querySelector(`.${styles.mobileMenuButton}`);

        if (mobileMenu && !mobileMenu.contains(target) &&
            menuButton && !menuButton.contains(target)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    if (isMobileMenuOpen) {
      // 이벤트가 즉시 실행되지 않도록 약간의 지연 추가
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          {logo && <img src={logo} alt="Logo" className={styles.logo} />}
          <h1 className={styles.title}>
            <Link to="/" onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector('[class*="imageCarousel"]');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              navigate('/');
            }}>
              {title}
              <span className={styles.subtitle}>Memorial</span>
            </Link>
          </h1>
        </div>

        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li
                key={item.id}
                className={styles.navItem}
                onMouseEnter={() => {
                  if (dropdownTimeout.current) {
                    clearTimeout(dropdownTimeout.current);
                    dropdownTimeout.current = null;
                  }
                  // 서브메뉴가 있으면 열고, 없으면 다른 서브메뉴 닫기
                  if (item.children) {
                    setActiveDropdown(item.id);
                  } else {
                    // 다른 메뉴 항목에 호버하면 기존 드롭다운 닫기
                    setActiveDropdown(null);
                  }
                }}
                onMouseLeave={() => {
                  if (item.children) {
                    dropdownTimeout.current = setTimeout(() => {
                      setActiveDropdown(null);
                    }, 100);
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // 홈 버튼인 경우 최상단으로 이동 (CROM 로고와 동일한 동작)
                    if (item.id === 'carousel' && item.label === '홈') {
                      const element = document.querySelector('[class*="imageCarousel"]');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                      // 서브메뉴가 있으면 토글
                      if (item.children) {
                        setActiveDropdown(activeDropdown === item.id ? null : item.id);
                      }
                    }
                    // 갤러리 버튼인 경우 gallery 섹션으로 이동
                    else if (item.id === 'gallery' && item.label === '갤러리') {
                      scrollToSection('gallery');
                      // 서브메뉴가 있으면 토글
                      if (item.children) {
                        setActiveDropdown(activeDropdown === item.id ? null : item.id);
                      }
                    } else {
                      scrollToSection(item.id);
                      setActiveDropdown(null);
                    }
                  }}
                  className={styles.navLink}
                >
                  {item.label}
                </button>
                {item.children && activeDropdown === item.id && (
                  <div className={styles.dropdown}>
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          // 메인 버튼인 경우 최상단으로 이동
                          if (child.id === 'carousel' && child.label === '메인') {
                            const element = document.querySelector('[class*="imageCarousel"]');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                            setActiveDropdown(null);
                          } else {
                            scrollToSection(child.id);
                          }
                        }}
                        className={styles.dropdownItem}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.authSection}>
          <button className={styles.loginBtn} onClick={() => setShowLoginModal(true)}>
            로그인
          </button>
        </div>

        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="메뉴 열기"
        >
          <span className={styles.hamburger}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {isMobileMenuOpen && (
          <nav className={styles.mobileNav}>
            <ul className={styles.mobileNavList}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      // 홈 버튼인 경우 최상단으로 이동 (CROM 로고와 동일한 동작)
                      if (item.id === 'carousel' && item.label === '홈') {
                        const element = document.querySelector('[class*="imageCarousel"]');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                        setIsMobileMenuOpen(false);
                      } else {
                        scrollToSection(item.id);
                      }
                    }}
                    className={styles.mobileNavLink}
                  >
                    {item.label}
                  </button>
                  {/* 서브메뉴가 있는 경우 표시 */}
                  {item.children && (
                    <ul className={styles.mobileSubNav}>
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <button
                            onClick={() => {
                              scrollToSection(child.id);
                            }}
                            className={styles.mobileSubNavLink}
                          >
                            {child.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      )}
    </header>
  );
};

export default Header;