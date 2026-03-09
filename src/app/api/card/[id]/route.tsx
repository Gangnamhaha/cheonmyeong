import { ImageResponse } from '@vercel/og'
import { getSupabase } from '@/lib/db'

export const runtime = 'edge'

type Params = { params: { id: string } }

const ELEMENT_COLORS: Record<string, string> = {
  목: '#22c55e',
  화: '#ef4444',
  토: '#f59e0b',
  금: '#e5e7eb',
  수: '#3b82f6',
}

type CardFormat = 'instagram' | 'story'

function normalizeCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  return 0
}

function getFormat(value: string | null): CardFormat {
  return value === 'story' ? 'story' : 'instagram'
}

function getDimensions(format: CardFormat): { width: number; height: number } {
  if (format === 'story') return { width: 1080, height: 1920 }
  return { width: 1080, height: 1350 }
}

function renderFallbackImage(format: CardFormat) {
  const { width, height } = getDimensions(format)
  const isStory = format === 'story'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: isStory ? '96px 72px' : '72px 64px',
          color: '#ffffff',
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(245,158,11,0.22), transparent 45%), linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: isStory ? 26 : 18 }}>
          <div style={{ color: '#f59e0b', fontSize: isStory ? 58 : 44, fontWeight: 700 }}>천명(天命)</div>
          <div style={{ fontSize: isStory ? 78 : 64, fontWeight: 700, lineHeight: 1.2 }}>사주 카드</div>
          <div style={{ fontSize: isStory ? 40 : 32, color: '#dbeafe' }}>결과를 찾지 못했어요</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isStory ? 20 : 14 }}>
          <div style={{ fontSize: isStory ? 34 : 28, color: '#f8fafc' }}>나도 사주 보기 → cheonmyeong.vercel.app</div>
        </div>
      </div>
    ),
    { width, height }
  )
}

export async function GET(request: Request, { params }: Params) {
  const format = getFormat(new URL(request.url).searchParams.get('format'))
  const { width, height } = getDimensions(format)
  const isStory = format === 'story'

  const supabase = getSupabase()
  if (!supabase) return renderFallbackImage(format)

  const { data } = await supabase
    .from('saju_results')
    .select('form_data, saju_data')
    .eq('id', params.id)
    .single()

  if (!data) return renderFallbackImage(format)

  const formData = (data.form_data ?? {}) as Record<string, unknown>
  const sajuData = (data.saju_data ?? {}) as Record<string, unknown>
  const saju = (sajuData.saju ?? {}) as Record<string, unknown>
  const dayPillar = (saju.dayPillar ?? {}) as Record<string, unknown>
  const yongsin = (sajuData.yongsin ?? {}) as Record<string, unknown>
  const oheng = ((sajuData.oheng ?? {}) as Record<string, unknown>).counts as Record<string, unknown> | undefined

  const name = typeof formData.name === 'string' && formData.name.trim() ? formData.name : '당신'
  const dayPillarText = `${dayPillar.heavenlyStemHanja ?? dayPillar.heavenlyStem ?? ''}${dayPillar.earthlyBranchHanja ?? dayPillar.earthlyBranch ?? ''}` || '미정'
  const yongsinText = typeof yongsin.yongsin === 'string' && yongsin.yongsin.trim() ? yongsin.yongsin : '미정'

  const elements: Array<'목' | '화' | '토' | '금' | '수'> = ['목', '화', '토', '금', '수']
  const maxCount = Math.max(1, ...elements.map((key) => normalizeCount(oheng?.[key])))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: isStory ? '96px 72px' : '72px 64px',
          color: '#ffffff',
          backgroundImage:
            'radial-gradient(circle at 15% 8%, rgba(245,158,11,0.22), transparent 40%), radial-gradient(circle at 90% 90%, rgba(59,130,246,0.2), transparent 38%), linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: isStory ? 26 : 18 }}>
          <div style={{ color: '#f59e0b', fontSize: isStory ? 58 : 44, fontWeight: 700 }}>천명(天命)</div>
          <div style={{ fontSize: isStory ? 80 : 66, fontWeight: 700, lineHeight: 1.15 }}>{name}님의 사주</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isStory ? 12 : 10 }}>
            <div style={{ fontSize: isStory ? 44 : 34, color: '#cbd5e1' }}>
              일주 <span style={{ color: '#f8fafc', fontWeight: 700 }}>{dayPillarText}</span>
            </div>
            <div style={{ fontSize: isStory ? 40 : 32, color: '#cbd5e1' }}>
              용신 <span style={{ color: '#f59e0b', fontWeight: 700 }}>{yongsinText}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isStory ? 20 : 14 }}>
          <div style={{ fontSize: isStory ? 32 : 26, color: '#e2e8f0' }}>오행 분포</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isStory ? 14 : 10 }}>
            {elements.map((el) => {
              const count = normalizeCount(oheng?.[el])
              const fillPercent = Math.max(8, Math.round((count / maxCount) * 100))
              return (
                <div key={el} style={{ display: 'flex', alignItems: 'center', gap: isStory ? 16 : 12 }}>
                  <div style={{ width: isStory ? 46 : 36, fontSize: isStory ? 30 : 24, color: '#f8fafc', fontWeight: 700 }}>{el}</div>
                  <div
                    style={{
                      flex: 1,
                      height: isStory ? 30 : 24,
                      borderRadius: 999,
                      backgroundColor: 'rgba(148,163,184,0.22)',
                      display: 'flex',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${fillPercent}%`,
                        height: '100%',
                        borderRadius: 999,
                        backgroundColor: ELEMENT_COLORS[el],
                        display: 'flex',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: isStory ? 58 : 50,
                      fontSize: isStory ? 28 : 22,
                      textAlign: 'right',
                      color: '#e2e8f0',
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: isStory ? 14 : 10, fontSize: isStory ? 34 : 28, color: '#f59e0b', fontWeight: 700 }}>
            나도 사주 보기 → cheonmyeong.vercel.app
          </div>
        </div>
      </div>
    ),
    { width, height }
  )
}
