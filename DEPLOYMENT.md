# 신해철 추모 사이트 배포 가이드

## 프로젝트 현황

### 완료된 기능
- ✅ 추모 메시지 게시판 (Firestore 연동)
- ✅ Gemini API 욕설 필터링 시스템
- ✅ Google/익명 로그인 인증
- ✅ 관리자 패널 (/admin 경로)
- ✅ 신해철 거리 갤러리 (87장 사진)
- ✅ 성남시 데이터 백업 (123개 이미지, 11페이지 메시지)
- ✅ 반응형 디자인 (320px-1440px)
- ✅ 프로덕션 빌드 완료

## Firebase 설정 필요사항

### 1. Firebase Console 설정
- **Authentication**
  - ✅ Google 로그인 활성화됨
  - ⚠️ 익명 로그인 활성화 필요
  - Sign-in providers에서 Anonymous 켜기

### 2. Firestore 보안 규칙
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 메시지 읽기는 모두 가능
    match /memorial_messages/{document=**} {
      allow read: if true;

      // 쓰기는 인증된 사용자만
      allow create: if request.auth != null;

      // 수정/삭제는 관리자만
      allow update, delete: if request.auth != null &&
        request.auth.token.email == 'tlawlgns59@gmail.com';
    }
  }
}
```

### 3. 관리자 설정
- 관리자 이메일: `tlawlgns59@gmail.com`
- AdminPanel.tsx 16번째 줄에서 변경 가능

## 배포 방법

### GitHub Pages 배포

1. **vite.config.ts 수정**
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/repository-name/' // 저장소 이름으로 변경
})
```

2. **배포 스크립트 추가 (package.json)**
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

3. **gh-pages 패키지 설치**
```bash
npm install --save-dev gh-pages
```

4. **배포 실행**
```bash
npm run deploy
```

### Vercel/Netlify 배포

1. **빌드 설정**
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: 18 이상

2. **환경변수 설정**
- 각 플랫폼에서 .env 파일의 변수들 설정

## 레거시 데이터 마이그레이션

성남시 추모 메시지 마이그레이션:
```bash
node src/scripts/migrateLegacyNode.cjs
```

⚠️ Firestore 권한 설정 후 실행

## 남은 작업

### 긴급
- [ ] Firebase Console에서 익명 로그인 활성화
- [ ] Firestore 보안 규칙 설정
- [ ] 관리자 이메일 확정

### 추가 개선사항
- [ ] 카카오/네이버 소셜 로그인
- [ ] 이미지 최적화 (WebP 변환)
- [ ] PWA 설정
- [ ] SEO 메타 태그
- [ ] 성능 최적화 (코드 스플리팅)

## 빌드 정보
- 빌드 크기: 747KB (gzip: 199KB)
- CSS: 38KB (gzip: 7.9KB)
- Node 버전: v18.16.1 (v20+ 권장)

## 접속 경로
- 메인: `/`
- 관리자: `/admin`

## 문의사항
- 개발자: [이메일]
- 빌드 날짜: 2025년 9월 24일