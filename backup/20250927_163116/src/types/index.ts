/**
 * 타입 정의 파일
 * 프로젝트 전체에서 사용되는 공통 타입 정의
 * 작성일: 2024-09-24
 */

// 미디어 아이템 타입 (사진, 음악, 영상)
export interface MediaItem {
  id: string;
  type: 'photo' | 'music' | 'video';
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  date?: string;
  metadata?: Record<string, any>;
}

// 추모 메시지 타입
export interface MemorialMessage {
  id: string;
  author: string;
  message: string;
  createdAt: Date;
  isApproved: boolean;
  likes?: number;
  ipHash?: string; // 프라이버시 보호를 위한 해시
}

// 네비게이션 아이템
export interface NavItem {
  id: string;
  label: string;
  href: string;
  isActive?: boolean;
  isExternal?: boolean;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// 페이지네이션 타입
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}