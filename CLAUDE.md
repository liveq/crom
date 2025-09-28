# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

신해철 추모관 웹사이트 - A memorial website for musician Shin Hae-chul, built with React 19, TypeScript, Vite, and Firebase. This is a single-page application with section-based navigation.

## Development Commands

```bash
# Development server (auto-opens browser on port 5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm preview
```

## Data Collection Commands

```bash
# Full memorial site crawling (459 messages from 77 pages)
node scripts/post-based-crawl.js

# Test individual page crawling
node scripts/test-crawl.js
node scripts/test-crawl-page77.js

# Data processing and cleanup
node scripts/duplicate-check.js
node scripts/fix-author-parsing.js
node scripts/remove-navigation.js
```

## Architecture

### Single-Page Design Pattern
- **Homepage Structure**: All content is in `HomePage.tsx` as scrollable sections
- **Navigation**: Header buttons scroll to sections using `scrollIntoView()` (following diora.co.kr pattern)
- **Routes**: Only two routes exist - `/` (HomePage) and `/admin` (AdminPanel)
- Section IDs: `hero`, `about`, `discography`, `gallery`, `memorial`, `street-gallery`

### Firebase Integration
- **Authentication**: Google OAuth, Anonymous, Email/Password (via `AuthContext`)
- **Firestore Collections**:
  - `memorialMessages`: User-submitted memorial messages with approval workflow
  - `adminUsers`: Admin email whitelist
- **Security**: Firestore rules in `firestore.rules` control write access
- **Admin Access**: Emails in `VITE_ADMIN_EMAILS` env var have admin privileges

### Content Moderation Pipeline
1. **Quick Filter**: Local bad word check (`moderationService.ts`)
2. **AI Moderation**: Google Gemini API content analysis (`geminiService.ts`)
3. **Auto-approval**: Messages with >0.8 confidence score approved automatically
4. **Manual Review**: Lower confidence messages require admin approval in AdminPanel

### Data Sources
- **Legacy Data**: `src/data/` contains crawled memorial messages (459 items), albums (16 items), and gallery images (102 items) from original memorial site
- **Dynamic Data**: New memorial messages stored in Firestore
- **Static Assets**: Images in `public/images/` (optimized carousel, gallery, street photos)
- **Crawled Archive**: Complete memorial messages from `cromst.seongnam.go.kr` before site closure (77 pages, 6 messages per page + 3 on last page)

### Key Component Patterns
- **CSS Modules**: All components use `.module.css` for scoped styling
- **No Comments**: Code should be self-documenting (unless specifically requested)
- **Responsive Design**: Mobile-first with hamburger menu in Header
- **Pagination**: Memorial messages show 6 per page (2x3 grid layout)

### State Management
- **Auth State**: `AuthContext` provides `user`, `isAdmin`, login/logout methods
- **Local State**: Components use React hooks (no external state library)
- **Liked Messages**: Stored in localStorage to prevent duplicate likes

### Web Scraping & Data Collection
Scripts in `scripts/` directory handle memorial message extraction from original site:
- **Main Crawler**: `post-based-crawl.js` - Full site crawler using POST cPage parameter (459 messages from 77 pages)
- **Test Scripts**: `test-crawl.js`, `test-crawl-page77.js` - Individual page testing
- **Data Processing**: `fix-author-parsing.js`, `duplicate-check.js`, `remove-navigation.js` - Data cleanup and validation
- **Architecture Discovery**: `hash-based-crawl.js`, `full-crawl-memorial.js` - Alternative pagination methods tested

**Crawling Architecture**:
- Target: `cromst.seongnam.go.kr:10005/community/memorial` (POST with cPage=1-77)
- Expected: 76 pages × 6 messages + 1 page × 3 messages = 459 total
- Technologies: axios, cheerio, fs for HTML parsing and data extraction
- Output: JSON files in `src/data/` for website integration

### Migration Scripts
Scripts in `src/scripts/` handle data imports:
- `parseMemorialMessages.ts`: HTML parser for legacy memorial data
- `uploadLegacyMessages.ts`: Firebase upload script (requires admin setup)

### Environment Setup
Copy `.env.example` to `.env` and configure:
- Firebase credentials (6 variables starting with `VITE_FIREBASE_`)
- Gemini API key (`VITE_GEMINI_API_KEY`)
- Admin emails (`VITE_ADMIN_EMAILS` - comma-separated)

### Section Scroll Implementation
Header navigation uses this pattern (from diora.co.kr):
```typescript
const scrollToSection = (sectionId: string) => {
  if (location.pathname !== '/') {
    navigate('/');
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  } else {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }
};
```

### Critical Work Guidelines

#### 작업 중단 키워드
다음 키워드가 포함된 경우 즉시 작업을 중단하고 대기:
- **수정 보류**
- **보류**
- **중지**
- **잠깐**
- **멈춰**
- **STOP**

#### 디자인 의도 존중
- 기존 디자인과 색상 스킴을 임의로 변경하지 않음
- 특히 추모 사이트의 경우 색상과 톤이 중요한 의미를 가짐
- Hero 섹션: 투명한 회색으로 추모의 이미지 표현 (네이비 X)

#### 작업 우선순위
- 시간보다 완성도 우선
- 근본적인 해결책 추구 (z-index 같은 임시방편 X)
- 사용자 지시사항을 정확히 읽고 따르기

### Important Implementation Notes
- **External Drive Only**: All development must be done on external drive (`/Volumes/X31/code/crom-memorial/`) - never use MacBook internal storage
- **Authentic Data Only**: Never generate fake memorial messages - only use authentic crawled data from original site
- **Page Refresh**: `ScrollToTop` component ensures page loads at top on route change
- **Legacy Badge**: Memorial messages with `isLegacy: true` show "이전 데이터" badge
- **Data Integrity**: 459 messages total (76×6 + 3 on page 77), includes 서태지 message on page 77 from 2018-02-09
- **Image Loading**: Use `loading="lazy"` for all gallery images
- **Button Styling**: Navigation buttons use `<button>` elements (not `<Link>`) for section scrolling
- **Memorial UI**: Grid layout (380px x 380px cards), white background, modern black & white theme
- **Auto-hide UI**: Arrow buttons and TOP button hide after 2 seconds of inactivity
- **Korean Text**: Use `word-break: keep-all` for proper Korean word wrapping
- **Server Conflicts**: Multiple dev servers may conflict - kill processes and restart if HMR fails
- **Data Files**: Final processed messages in `memorialMessages.json` (for website), complete raw data in `memorialMessages-final.json`