// Asset path utility for handling base URL in production
const BASE_URL = import.meta.env.BASE_URL || '/';

export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Combine with base URL
  return `${BASE_URL}${cleanPath}`;
}

export function getImagePath(path: string): string {
  return getAssetPath(path);
}