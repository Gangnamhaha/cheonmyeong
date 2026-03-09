import type { MetadataRoute } from 'next'
import { BLOG_ARTICLE_SLUGS } from '@/data/blog-articles'

const BASE_URL = 'https://cheonmyeong.vercel.app'
const ZODIAC_SLUGS = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'sheep', 'monkey', 'rooster', 'dog', 'pig'] as const
const PROGRAMMATIC_ZODIAC_SLUGS = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'] as const
const FORTUNE_TOPIC_SLUGS = ['jaemulun', 'yeonaewun', 'chwieobun'] as const
const MONTH_NUMBER_SLUGS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const
const WESTERN_ZODIAC_SLUGS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/saju/free`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/fortune/today`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.93,
    },
    ...ZODIAC_SLUGS.map((slug) => ({
      url: `${BASE_URL}/fortune/ddi/${slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.88,
    })),
    ...PROGRAMMATIC_ZODIAC_SLUGS.flatMap((animal) =>
      FORTUNE_TOPIC_SLUGS.map((topic) => ({
        url: `${BASE_URL}/fortune/ddi/${animal}/${topic}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      })),
    ),
    {
      url: `${BASE_URL}/fortune/2026`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/fortune/2026/spring`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.87,
    },
    {
      url: `${BASE_URL}/fortune/2026/summer`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.87,
    },
    {
      url: `${BASE_URL}/fortune/2026/fall`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.87,
    },
    {
      url: `${BASE_URL}/fortune/2026/winter`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.87,
    },
    ...MONTH_NUMBER_SLUGS.map((month) => ({
      url: `${BASE_URL}/fortune/2026/month/${month}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    ...WESTERN_ZODIAC_SLUGS.map((sign) => ({
      url: `${BASE_URL}/fortune/zodiac/${sign}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    {
      url: `${BASE_URL}/fortune/2026/tojeongbigyeol`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/fortune/2026/samjae`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/fortune/2026/daebak`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/gunghap`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.88,
    },
    {
      url: `${BASE_URL}/tools/mbti`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.88,
    },
    {
      url: `${BASE_URL}/tools/bloodtype`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.88,
    },
    {
      url: `${BASE_URL}/tools/name`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.88,
    },
    {
      url: `${BASE_URL}/gunghap/free`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/guide/saju-basics`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/guide/oheng`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...BLOG_ARTICLE_SLUGS.map(slug => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/history`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/inquiry`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/refund`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
