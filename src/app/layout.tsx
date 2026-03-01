import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '천명(天命) - 나의 사주 풀이',
  description: '생년월일시를 입력하면 사주팔자와 오행을 분석하고 AI가 해석해드립니다.',
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