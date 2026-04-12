import type { Metadata } from 'next'
import { Noto_Serif_KR } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { SITE_URL } from '@/lib/constants'
import ErrorBoundary from '@/components/ErrorBoundary'
import ThemeProvider from '@/components/ThemeProvider'
import AuthProvider from '@/components/AuthProvider'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import PushNotificationBanner from '@/components/PushNotificationBanner'
import StickyMobileCTA from '@/components/StickyMobileCTA'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID

const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
  preload: true,
  variable: '--font-noto-serif-kr',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: '사주해 - AI 사주 풀이 | 무료 사주팔자, 궁합, 오늘의 운세',
  description: '특허 출원 AI가 사주팔자를 음악·영상·해석으로 분석합니다. 무료 사주, 궁합, 오행, 대운, 오늘의 운세까지. 매일 1회 무료 AI 해석, 월 3,900원부터 구독.',
  keywords: ['사주', '사주팔자', '무료 사주', 'AI 사주', '사주 풀이', '오늘의 운세', '궁합', '사주 궁합', '오행', '십신', '용신', '대운', '운세', '사주해', '명리학', '토정비결', '신년운세', '2026 운세', '사주 음악', '만세력', '무료 운세', '사주 앱'],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: '사주해 - AI 사주 풀이 | 무료 사주, 궁합, 운세',
    description: '특허 출원 AI가 당신의 사주를 음악과 영상으로 변환합니다. 무료 사주 분석, AI 해석, 궁합, 대운까지.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '사주해',
    images: [{
      url: '/opengraph-image.png',
      width: 512,
      height: 512,
      alt: '사주해 - 특허 AI 사주 풀이',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '사주해 - 당신의 사주가 음악이 됩니다',
    description: '특허 출원 멀티모달 AI로 사주를 보고, 듣고, 느끼세요. 매일 1회 무료 AI 해석.',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: '2tHksPHXEJsB6C-JkKcaTj9JvFlJ6ZDryxVUFwKxAdM',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${notoSerifKr.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="naver-site-verification" content="79258edfff8cfed2a6cd162dcfa591ac9a5a2770" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            }
          `}
        </Script>
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "사주해 - AI 사주 풀이 | 무료 사주팔자, 궁합, 운세",
              "url": SITE_URL,
              "description": "특허 출원 AI가 사주팔자를 음악·영상·해석으로 분석합니다. 무료 사주, 궁합, 오행, 대운, 오늘의 운세까지.",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "AggregateOffer",
                "lowPrice": "0",
                "highPrice": "14900",
                "priceCurrency": "KRW"
              },
              "inLanguage": "ko",
              "creator": {
                "@type": "Organization",
                "name": "주식회사 에이아이트리"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1200"
              }
            })
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <ErrorBoundary>{children}</ErrorBoundary>
            <Footer />
            <PushNotificationBanner />
            <StickyMobileCTA />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
