import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '천명(天命) - AI 사주팔자 풀이',
  description: '생년월일시를 입력하면 사주팔자, 오행, 십신, 용신, 대운을 분석하고 AI가 해석해드립니다. 무료 사주 풀이 서비스.',
  keywords: ['사주', '사주팔자', '팔자', '오행', '십신', '용신', '대운', '운세', 'AI 사주', '무료 사주', '천명', '명리학'],
  openGraph: {
    title: '천명(天命) - AI 사주팔자 풀이',
    description: '생년월일시를 입력하면 사주팔자, 오행, 십신, 용신, 대운을 분석하고 AI가 해석해드립니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '천명(天命)',
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
    <html lang="ko">
      <body className="bg-slate-900 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}