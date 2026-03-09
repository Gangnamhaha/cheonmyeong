import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  FORTUNE_TOPICS,
  TOPIC_BREAKDOWN_LABELS,
  ZODIAC_ANIMALS,
  findAnimalBySlug,
  findTopicBySlug,
  getTopicData,
} from '@/data/zodiac-topics'

export const revalidate = 3600

type Params = {
  params: {
    animal: string
    topic: string
  }
}

function getCanonicalAnimalSlug(animalSlug: string) {
  const animal = findAnimalBySlug(animalSlug)
  return animal?.slug
}

export function generateStaticParams() {
  return ZODIAC_ANIMALS.flatMap((animal) =>
    FORTUNE_TOPICS.map((topic) => ({
      animal: animal.slug,
      topic: topic.slug,
    })),
  )
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const animal = findAnimalBySlug(params.animal)
  const topic = findTopicBySlug(params.topic)

  if (!animal || !topic) {
    return {
      title: '띠별 운세 | 천명',
      description: '띠별 세부 운세 카테고리를 확인해 보세요.',
    }
  }

  const canonicalAnimalSlug = getCanonicalAnimalSlug(params.animal)
  if (!canonicalAnimalSlug) {
    return {
      title: '띠별 운세 | 천명',
      description: '띠별 세부 운세 카테고리를 확인해 보세요.',
    }
  }

  const topicData = getTopicData(canonicalAnimalSlug, topic.slug)
  const title = `${animal.korean}띠 ${topic.slug} 2026 - ${animal.korean}띠 ${topic.korean} 운세 | 천명`

  return {
    title,
    description: topicData.description,
    keywords: [
      `${animal.korean}띠 ${topic.slug}`,
      `${animal.korean}띠 2026 ${topic.slug}`,
      `${animal.korean}띠 ${topic.korean}`,
      `${animal.korean}띠 ${topic.korean} 2026`,
      `${animal.korean}띠 운세`,
      '천명',
    ],
    alternates: {
      canonical: `/fortune/ddi/${canonicalAnimalSlug}/${topic.slug}`,
    },
  }
}

export default function DdiAnimalTopicPage({ params }: Params) {
  const animal = findAnimalBySlug(params.animal)
  const topic = findTopicBySlug(params.topic)

  if (!animal || !topic) {
    notFound()
  }

  const canonicalAnimalSlug = getCanonicalAnimalSlug(params.animal)
  if (!canonicalAnimalSlug) {
    notFound()
  }

  const topicData = getTopicData(canonicalAnimalSlug, topic.slug)
  const topicLinksForAnimal = FORTUNE_TOPICS.filter((item) => item.slug !== topic.slug)
  const otherAnimals = ZODIAC_ANIMALS.filter((item) => item.slug !== canonicalAnimalSlug)
  const paragraphs = topicData.fortuneText.split('\n\n')

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <p className="text-xs text-slate-400">2026 세부 카테고리 운세</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">
            {animal.icon} {animal.korean}띠 {topic.korean} 2026
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {animal.korean}띠를 위한 {topic.korean} 집중 분석입니다. {topic.headline} 오늘의 선택에 바로 적용할 수 있는 실전 조언까지 함께 정리했습니다.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">{animal.korean}띠 {topic.korean} 상세 해설</h2>
          <div className="mt-3 space-y-4 text-sm leading-relaxed text-slate-300">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">{topic.korean} 핵심 세부 흐름</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {TOPIC_BREAKDOWN_LABELS[topic.slug].map((item) => (
              <article key={item.title} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="font-serif-kr text-lg font-bold text-amber-300">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">더 정확한 운세로 이어서 확인하세요</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            띠 운세는 방향을 보여 주고, 실제 타이밍은 개인 사주에서 더 정밀하게 읽힙니다. 지금 흐름을 놓치지 않도록 맞춤 해석을 함께 확인해 보세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 transition hover:bg-amber-400">
              내 사주 해석 보기
            </Link>
            <Link href={`/fortune/ddi/${canonicalAnimalSlug}`} className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              {animal.korean}띠 메인 운세
            </Link>
            <Link href="/fortune/2026" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              2026년 전체 운세
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              프리미엄 운세 보기
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">{animal.korean}띠 다른 주제 운세</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topicLinksForAnimal.map((item) => (
              <Link
                key={item.slug}
                href={`/fortune/ddi/${canonicalAnimalSlug}/${item.slug}`}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
              >
                {animal.korean}띠 {item.korean}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">다른 띠의 {topic.korean} 비교하기</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherAnimals.map((item) => (
              <Link
                key={item.slug}
                href={`/fortune/ddi/${item.slug}/${topic.slug}`}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
              >
                {item.icon} {item.korean}띠 {topic.korean}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
