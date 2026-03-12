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

function normalizeCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return 0
}

export async function GET(_request: Request, { params }: Params) {
  const supabase = getSupabase()
  if (!supabase) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a2e',
            color: '#fff',
            fontSize: 48,
          }}
        >
          사주해
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  const { data } = await supabase
    .from('saju_results')
    .select('form_data, saju_data')
    .eq('id', params.id)
    .single()

  const formData = (data?.form_data ?? {}) as Record<string, unknown>
  const sajuData = (data?.saju_data ?? {}) as Record<string, unknown>
  const saju = (sajuData.saju ?? {}) as Record<string, unknown>
  const dayPillar = (saju.dayPillar ?? {}) as Record<string, unknown>
  const yongsin = (sajuData.yongsin ?? {}) as Record<string, unknown>
  const oheng = ((sajuData.oheng ?? {}) as Record<string, unknown>).counts as Record<string, unknown> | undefined

  const name = typeof formData.name === 'string' && formData.name.trim() ? formData.name : '당신'
  const dayPillarText = `${dayPillar.heavenlyStemHanja ?? dayPillar.heavenlyStem ?? ''}${dayPillar.earthlyBranchHanja ?? dayPillar.earthlyBranch ?? ''}` || '미정'
  const yongsinText = typeof yongsin.yongsin === 'string' ? yongsin.yongsin : '미정'

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
          background: '#1a1a2e',
          color: '#ffffff',
          padding: '52px 64px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: '#f59e0b', fontSize: 36, fontWeight: 700 }}>사주해</div>
          <div style={{ fontSize: 58, fontWeight: 700 }}>{name}님의 사주팔자</div>
          <div style={{ display: 'flex', gap: 24, fontSize: 32 }}>
            <div>일주: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{dayPillarText}</span></div>
            <div>용신: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{yongsinText}</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
            {elements.map((el) => {
              const count = normalizeCount(oheng?.[el])
              const height = 28 + (count / maxCount) * 100
              return (
                <div key={el} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 120,
                      height,
                      background: ELEMENT_COLORS[el],
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: el === '금' ? '#111827' : '#ffffff',
                      fontSize: 30,
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </div>
                  <div style={{ fontSize: 24, color: '#cbd5e1' }}>{el}</div>
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#f59e0b' }}>나도 사주 보기 →</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
