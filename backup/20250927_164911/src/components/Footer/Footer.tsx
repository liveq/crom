/**
 * Footer 컴포넌트
 * 사이트 하단 정보 및 링크
 * 저작권, 연락처, SNS 링크 포함
 */

import React from 'react';
import styles from './Footer.module.css';

interface FooterProps {
  copyrightHolder?: string;
  copyrightYear?: string;
  email?: string;
  socialLinks?: {
    platform: string;
    url: string;
    icon?: string;
  }[];
  links?: {
    label: string;
    href: string;
  }[];
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  copyrightHolder = "CROM",
  copyrightYear = "2025",
  email,
  socialLinks = [],
  links = [
    { label: '개인정보처리방침', href: '#privacy' },
    { label: '이용약관', href: '#terms' },
    { label: '문의하기', href: '#contact' },
  ],
  className
}) => {
  const currentYear = new Date().getFullYear();
  const displayYear = copyrightYear === currentYear.toString()
    ? copyrightYear
    : `${copyrightYear}-${currentYear}`;

  return (
    <footer className={`${styles.footer} ${className || ''}`}>
      <div className={styles.container}>
        {/* 상단 섹션 */}
        <div className={styles.topSection}>
          {/* 브랜드/정보 섹션 */}
          <div className={styles.brandSection}>
            <h3 className={styles.brandTitle}>CROM</h3>
            <p className={styles.brandDescription}>
              "Here I Stand For You"
              <br />
              영원한 마왕을 기억하며
            </p>
          </div>

          {/* 링크 섹션 */}
          <div className={styles.linkSection}>
            <h4 className={styles.linkTitle}>바로가기</h4>
            <ul className={styles.linkList}>
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={styles.link}
                    onClick={(e) => {
                      // 해시 링크인 경우 기본 동작 방지
                      if (link.href.startsWith('#')) {
                        e.preventDefault();
                        console.log(`Navigate to: ${link.href}`);
                      }
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 연락처 섹션 */}
          {(email || socialLinks.length > 0) && (
            <div className={styles.contactSection}>
              <h4 className={styles.contactTitle}>연락처</h4>

              {email && (
                <a
                  href={`mailto:${email}`}
                  className={styles.email}
                >
                  {email}
                </a>
              )}

              {socialLinks.length > 0 && (
                <div className={styles.socialLinks}>
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={social.platform}
                    >
                      {social.icon || social.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 추가 정보 섹션 */}
          <div className={styles.infoSection}>
            <h4 className={styles.infoTitle}>안내</h4>
            <p className={styles.infoText}>
              본 사이트는 故 신해철님을 추모하기 위한
              <br />
              비영리 목적으로 운영됩니다.
              <br />
              <br />
              모든 콘텐츠의 저작권은
              <br />
              원저작권자에게 있습니다.
            </p>
          </div>
        </div>

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 하단 섹션 - 저작권 */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © {displayYear} {copyrightHolder}. All rights reserved.
          </p>

          {/* 추모 문구 */}
          <p className={styles.memorial}>
            1968.05.06 - 2014.10.27 | Forever in our hearts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;