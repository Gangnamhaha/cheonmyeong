import type { Metadata } from 'next'
import { Noto_Serif_KR } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
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
  metadataBase: new URL('https://sajuhae.vercel.app'),
  title: '사주해 - AI 사주팔자 풀이',
  description: '생년월일시를 입력하면 사주팔자, 오행, 십신, 용신, 대운을 분석하고 AI가 해석해드립니다. 무료 사주 풀이 서비스.',
  keywords: ['사주', '사주팔자', '팔자', '오행', '십신', '용신', '대운', '운세', 'AI 사주', '무료 사주', '사주해', '명리학'],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: '사주해 - AI 사주팔자 풀이',
    description: '생년월일시를 입력하면 사주팔자, 오행, 십신, 용신, 대운을 분석하고 AI가 해석해드립니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '사주해',
    images: [{
      url: '/opengraph-image.png',
      width: 512,
      height: 512,
      alt: '사주해 - AI 사주팔자 풀이',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '사주해 - AI 사주팔자 풀이',
    description: '나의 사주팔자를 AI로 분석해보세요. 십신, 용신, 대운까지 상세 해석.',
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
              "name": "사주해 - AI 사주팔자 풀이",
              "url": "https://sajuhae.vercel.app",
              "description": "생년월일시를 입력하면 사주팔자, 오행, 십신, 용신, 대운을 분석하고 AI가 해석해드립니다.",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "AggregateOffer",
                "lowPrice": "0",
                "highPrice": "29900",
                "priceCurrency": "KRW"
              },
              "inLanguage": "ko",
              "creator": {
                "@type": "Organization",
                "name": "사주해"
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
