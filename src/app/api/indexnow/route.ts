import { NextRequest, NextResponse } from 'next/server'
import { BLOG_ARTICLE_SLUGS } from '@/data/blog-articles'

const INDEXNOW_KEY = 'b4f8c2d1e6a3f7094c5b8d2e1a6f3079'
const HOST = 'cheonmyeong.vercel.app'
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`

// Zodiac animals
const ZODIAC_ANIMALS = [
  'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
  'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'
]

// Zodiac topics
const ZODIAC_TOPICS = ['jaemulun', 'yeonaewun', 'chwieobun']

// Western zodiac signs
const WESTERN_ZODIAC = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
]

function buildUrlList(): string[] {
  const urls: string[] = []
  const baseUrl = `https://${HOST}`

  // Homepage
  urls.push(`${baseUrl}/`)

  // Main pages
  urls.push(
    `${baseUrl}/saju/free`,
    `${baseUrl}/fortune/today`,
    `${baseUrl}/gunghap`,
    `${baseUrl}/gunghap/free`,
    `${baseUrl}/pricing`
  )

  // 2026 fortune pages
  urls.push(
    `${baseUrl}/fortune/2026`,
    `${baseUrl}/fortune/2026/spring`,
    `${baseUrl}/fortune/2026/summer`,
    `${baseUrl}/fortune/2026/fall`,
    `${baseUrl}/fortune/2026/winter`,
    `${baseUrl}/fortune/2026/tojeongbigyeol`,
    `${baseUrl}/fortune/2026/samjae`,
    `${baseUrl}/fortune/2026/daebak`
  )

  // Monthly fortune pages (1-12)
  for (let month = 1; month <= 12; month++) {
    urls.push(`${baseUrl}/fortune/2026/month/${month}`)
  }

  // Zodiac animal pages with topics
  for (const animal of ZODIAC_ANIMALS) {
    urls.push(`${baseUrl}/fortune/ddi/${animal}`)
    for (const topic of ZODIAC_TOPICS) {
      urls.push(`${baseUrl}/fortune/ddi/${animal}/${topic}`)
    }
  }

  // Western zodiac pages
  for (const sign of WESTERN_ZODIAC) {
    urls.push(`${baseUrl}/fortune/zodiac/${sign}`)
  }

  // Tools pages
  urls.push(
    `${baseUrl}/tools/mbti`,
    `${baseUrl}/tools/bloodtype`,
    `${baseUrl}/tools/name`
  )

  // Blog pages
  urls.push(`${baseUrl}/blog`)
  for (const slug of BLOG_ARTICLE_SLUGS) {
    urls.push(`${baseUrl}/blog/${slug}`)
  }

  // Guide pages
  urls.push(
    `${baseUrl}/guide/saju-basics`,
    `${baseUrl}/guide/oheng`
  )

  return urls
}

export async function GET(req: NextRequest) {
  // Verify CRON_SECRET from authorization header or query param
  const authHeader = req.headers.get('authorization')
  const secretParam = req.nextUrl.searchParams.get('secret')
  const cronSecret = process.env.CRON_SECRET

  const isAuthorized = 
    (authHeader === `Bearer ${cronSecret}`) || 
    (secretParam === cronSecret)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const urlList = buildUrlList()

    // Submit to IndexNow API
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: urlList,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('IndexNow API error:', response.status, errorText)
      return NextResponse.json(
        { 
          error: 'IndexNow API error',
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'URLs submitted to IndexNow successfully',
      urlCount: urlList.length,
      host: HOST,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('IndexNow submission error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to submit URLs to IndexNow',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
