import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'
import type { GunghapResult } from '@/lib/gunghap'
import { generateGunghapReport, generatePremiumReport, generateProReport } from '@/lib/report-generator'

type Category = '종합' | '성격' | '연애' | '직업' | '건강' | '재물' | '인생성장'
type ProCategory = Category | '대운 분석' | '세운 전망 (2025-2027)' | '인생 통합 조언'
type GunghapCategory = '궁합총평' | '성격궁합' | '연애궁합' | '직장궁합' | '관계조언'

function buildContentDisposition(name: string, tier: 'basic' | 'pro' | 'gunghap', person2Name?: string): string {
  const safeName = name.replace(/[\\/:*?"<>|]/g, '').trim() || '사용자'
  const safeSecondName = (person2Name ?? '상대방').replace(/[\\/:*?"<>|]/g, '').trim() || '상대방'
  const filename = tier === 'gunghap'
    ? `사주해_궁합리포트_${safeName}_${safeSecondName}.docx`
    : `사주해_프리미엄_리포트_${safeName}.docx`
  const encoded = encodeURIComponent(filename)
  return `attachment; filename="premium_report.docx"; filename*=UTF-8''${encoded}`
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'DB가 설정되지 않았습니다.' }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('premium_reports')
    .select('id, form_data, saju_data, report_content, tier')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '리포트를 찾을 수 없습니다.' }, { status: 404 })
  }

  const interpretations = (data.report_content ?? {}) as Partial<Record<ProCategory | GunghapCategory, string>>
  const formData = (data.form_data ?? {}) as Record<string, unknown>
  const sajuData = data.saju_data
  const reportTier = data.tier === 'gunghap' || formData.reportTier === 'gunghap'
    ? 'gunghap'
    : formData.reportTier === 'pro'
      ? 'pro'
      : 'basic'
  const person2Data = (formData.person2Data ?? {}) as Record<string, unknown>
  const gunghapResult = (formData.gunghapResult ?? {}) as GunghapResult

  const buffer = reportTier === 'pro'
    ? await generateProReport(formData, sajuData, interpretations as Partial<Record<ProCategory, string>>, {
      daeunInterpretation: interpretations['대운 분석'],
      seunInterpretation: interpretations['세운 전망 (2025-2027)'],
      lifeAdvice: interpretations['인생 통합 조언'],
    })
    : reportTier === 'gunghap'
      ? await generateGunghapReport(
        formData,
        person2Data,
        gunghapResult,
        interpretations as Partial<Record<GunghapCategory, string>>,
      )
      : await generatePremiumReport(formData, sajuData, interpretations as Partial<Record<Category, string>>)
  const fileNameSource = typeof formData.name === 'string' ? formData.name : '사용자'
  const fileNameSource2 = typeof person2Data.name === 'string' ? person2Data.name : '상대방'

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': buildContentDisposition(fileNameSource, reportTier, fileNameSource2),
      'Cache-Control': 'no-store',
    },
  })
}
