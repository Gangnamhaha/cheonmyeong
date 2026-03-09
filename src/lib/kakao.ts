// Kakao SDK integration for social sharing
// Requires NEXT_PUBLIC_KAKAO_JS_KEY env var and Kakao SDK loaded in layout

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
  const baseUrl = 'https://cheonmyeong.vercel.app'
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
      imageUrl: 'https://cheonmyeong.vercel.app/opengraph-image.png',
      link: {
        mobileWebUrl: 'https://cheonmyeong.vercel.app/gunghap',
        webUrl: 'https://cheonmyeong.vercel.app/gunghap',
      },
    },
    buttons: [
      {
        title: '나도 궁합 보기',
        link: {
          mobileWebUrl: 'https://cheonmyeong.vercel.app/gunghap',
          webUrl: 'https://cheonmyeong.vercel.app/gunghap',
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
