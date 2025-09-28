# GitHub Secrets 설정 가이드

## 🔐 중요: 보안을 위해 반드시 GitHub Secrets를 설정해야 합니다

### 설정 방법:

1. **GitHub 저장소 페이지로 이동**
   - https://github.com/liveq/crom

2. **Settings 탭 클릭**

3. **왼쪽 메뉴에서 "Secrets and variables" → "Actions" 클릭**

4. **"New repository secret" 버튼 클릭**

5. **다음 Secrets를 하나씩 추가:**

| Secret Name | Value | 설명 |
|------------|-------|------|
| `VITE_FIREBASE_API_KEY` | (Firebase 콘솔에서 복사) | Firebase API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | memorial-59f0f.firebaseapp.com | Firebase Auth 도메인 |
| `VITE_FIREBASE_PROJECT_ID` | memorial-59f0f | Firebase 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | memorial-59f0f.firebasestorage.app | Firebase Storage 버킷 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (Firebase 콘솔에서 복사) | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | (Firebase 콘솔에서 복사) | Firebase App ID |
| `VITE_ADMIN_EMAILS` | admin@example.com | 관리자 이메일 (쉼표로 구분) |
| `VITE_GEMINI_API_KEY` | (Google AI Studio에서 재생성 필요) | Gemini API 키 |
| `VITE_ADMIN_MASTER_PASSWORD` | (새로운 비밀번호 설정) | 관리자 마스터 비밀번호 |

### ⚠️ 보안 주의사항:

1. **API 키 재생성 필요:**
   - Gemini API 키가 GitHub에 노출되었으므로 **반드시 재생성**하세요
   - Google AI Studio: https://makersuite.google.com/app/apikey

2. **Firebase 보안 규칙 확인:**
   - Firebase 콘솔에서 Firestore 보안 규칙 검토
   - Storage 보안 규칙 검토

3. **마스터 비밀번호 변경:**
   - 기본값 사용하지 말고 새로운 강력한 비밀번호 설정

### 📝 현재 .env 파일의 값 (참고용):

```
VITE_FIREBASE_API_KEY=(Firebase 콘솔에서 확인)
VITE_FIREBASE_AUTH_DOMAIN=memorial-59f0f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=memorial-59f0f
VITE_FIREBASE_STORAGE_BUCKET=memorial-59f0f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=(Firebase 콘솔에서 확인)
VITE_FIREBASE_APP_ID=(Firebase 콘솔에서 확인)
VITE_ADMIN_EMAILS=admin@example.com
VITE_GEMINI_API_KEY=(재생성 필요)
VITE_ADMIN_MASTER_PASSWORD=(새 비밀번호 설정)
```

### ✅ 설정 완료 후:

1. 모든 Secrets 추가 완료
2. GitHub Actions가 자동으로 빌드 및 배포 시작
3. Actions 탭에서 진행 상황 확인

### 🚀 배포 프로세스:

1. main 브랜치에 커밋 푸시
2. GitHub Actions 자동 실행
3. 빌드 및 GitHub Pages 배포
4. https://liveq.github.io/crom/ 에서 확인

---

**중요**: 이 파일은 가이드용입니다. 실제 API 키나 비밀번호를 이 파일에 절대 저장하지 마세요!