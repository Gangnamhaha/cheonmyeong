import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'
import ThemeProvider from '@/components/ThemeProvider'
import AuthProvider from '@/components/AuthProvider'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID

export const metadata: Metadata = {
  metadataBase: new URL('https://cheonmyeong.vercel.app'),
  title: '천명(天命) - AI 사주팔자 풀이',
  description: '생년월일시를 입력하면 사주팔자, 오행, 십신, 용신, 대운을 분석하고 AI가 해석해드립니다. 무료 사주 풀이 서비스.',
  keywords: ['사주', '사주팔자', '팔자', '오행', '십신', '용신', '대운', '운세', 'AI 사주', '무료 사주', '천명', '명리학'],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: '천명(天命) - AI 사주팔자 풀이',
    description: '생년월일시를 입력하면 사주팔자, 오행, 십신, 용신, 대운을 분석하고 AI가 해석해드립니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '천명(天命)',
    images: [{
      url: '/opengraph-image.png',
      width: 512,
      height: 512,
      alt: '천명(天命) - AI 사주팔자 풀이',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '천명(天命) - AI 사주팔자 풀이',
    description: '나의 사주팔자를 AI로 분석해보세요. 십신, 용신, 대운까지 상세 해석.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
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
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            }
          `}
        </Script>
      </head>
      <body className="antialiased min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <ErrorBoundary>{children}</ErrorBoundary>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
