// Kakao SDK integration for social sharing
// Requires NEXT_PUBLIC_KAKAO_JS_KEY env var and Kakao SDK loaded in layout

import { SITE_URL } from '@/lib/constants'

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void
      isInitialized: () => boolean
      Share: {
        sendDefault: (params: Record<string, unknown>) => void
      }
    }
  }
}

// NEXT_PUBLIC_ env vars are inlined at build time by Next.js
const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || ''

/** Initialize Kakao SDK (idempotent) */
export function initKakao(): boolean {
  if (typeof window === 'undefined') return false
  if (!window.Kakao) return false
  if (window.Kakao.isInitialized()) return true

  if (!KAKAO_JS_KEY) {
    console.warn('[kakao] NEXT_PUBLIC_KAKAO_JS_KEY is not set')
    return false
  }

  try {
    window.Kakao.init(KAKAO_JS_KEY)
    return true
  } catch (e) {
    console.error('[kakao] init failed:', e)
    return false
  }
}

/** Share saju result via KakaoTalk */
export function shareSajuResult(params: {
  name: string
  dayPillar: string
  yongsin: string
  summary?: string
  resultUrl?: string
  resultId?: string
}) {
  const baseUrl = SITE_URL
  const shareUrl = params.resultUrl || baseUrl
  const extractedResultId = params.resultId || (shareUrl.includes('/result/') ? shareUrl.split('/result/')[1]?.split('?')[0] : undefined)
  const imageUrl = extractedResultId
    ? `${baseUrl}/api/og/${extractedResultId}`
    : `${baseUrl}/opengraph-image.png`

  if (!initKakao()) {
    // Fallback: copy URL to clipboard
    fallbackShare('사주 결과', shareUrl)
    return
  }

  const description = params.summary
    ? params.summary.slice(0, 100)
    : `일주: ${params.dayPillar} | 용신: ${params.yongsin}`

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `${params.name}님의 사주팔자 결과`,
      description,
      imageUrl,
      link: {
        mobileWebUrl: shareUrl,
        webUrl: shareUrl,
      },
    },
    buttons: [
      {
        title: '나도 사주 보기',
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
    ],
  })
}

/** Share gunghap result via KakaoTalk */
export function shareGunghapResult(params: {
  person1: string
  person2: string
  score?: number
}) {
  if (!initKakao()) {
    fallbackShare('궁합 결과')
    return
  }

  const scoreText = params.score !== undefined ? `${params.score}점` : ''
  const description = scoreText
    ? `궁합 점수: ${scoreText} — 나도 궁합을 확인해보세요!`
    : '나도 궁합을 확인해보세요!'

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `${params.person1} ♥ ${params.person2} 궁합 결과`,
      description,
      imageUrl: `${SITE_URL}/opengraph-image.png`,
      link: {
        mobileWebUrl: `${SITE_URL}/gunghap`,
        webUrl: `${SITE_URL}/gunghap`,
      },
    },
    buttons: [
      {
        title: '나도 궁합 보기',
        link: {
          mobileWebUrl: `${SITE_URL}/gunghap`,
          webUrl: `${SITE_URL}/gunghap`,
        },
      },
    ],
  })
}

/** Share referral invite via KakaoTalk */
export function shareReferralInvite(referralCode: string) {
  const trimmedCode = referralCode.trim().toUpperCase()
  const link = `${SITE_URL}/signup?ref=${trimmedCode}`

  if (!trimmedCode) {
    fallbackShare('초대', `${SITE_URL}/signup`)
    return
  }

  if (!initKakao()) {
    fallbackShare('초대', link)
    return
  }

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: '사주해 친구 초대',
      description: '사주해에서 무료 AI 사주를 확인해보세요! 가입하면 3 이용권 보너스!',
      imageUrl: `${SITE_URL}/opengraph-image.png`,
      link: {
        mobileWebUrl: link,
        webUrl: link,
      },
    },
    buttons: [
      {
        title: '초대 링크 열기',
        link: {
          mobileWebUrl: link,
          webUrl: link,
        },
      },
    ],
  })
}

/** Fallback when Kakao SDK not available — copy link */
function fallbackShare(label: string, url?: string) {
  const targetUrl = url || window.location.href
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(targetUrl).then(() => {
      alert(`${label} 링크가 복사되었습니다!`)
    }).catch(() => {
      alert('링크 복사에 실패했습니다.')
    })
  }
}
