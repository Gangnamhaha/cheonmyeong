/**
 * Site URL constants
 *
 * Set NEXT_PUBLIC_SITE_URL in .env.local to override (e.g. https://cheonmyeong.kr)
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://sajuhae.vercel.app'
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, '')

/** Detect if running inside a native app WebView (react-native-webview injects this) */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as unknown as Record<string, unknown>).ReactNativeWebView
}
