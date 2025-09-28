import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/crom/',  // GitHub Pages 배포 경로
  plugins: [react()],
  // 개발 서버 설정
  server: {
    open: true,  // 자동으로 브라우저 열기
    port: 5173,  // 포트 고정
    host: true,  // 네트워크에서 접근 가능
  },
  // 빌드 설정
  build: {
    outDir: 'dist',  // 빌드 출력 디렉토리
    sourcemap: true,  // 소스맵 생성 (디버깅용)
  }
})
