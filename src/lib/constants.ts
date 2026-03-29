/**
 * Site URL constants
 *
 * Set NEXT_PUBLIC_SITE_URL in .env.local to override (e.g. https://cheonmyeong.kr)
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://sajuhae.vercel.app'
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, '')
