import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'
import { generatePremiumReport } from '@/lib/report-generator'

type Category = '종합' | '성격' | '연애' | '직업' | '건강' | '재물' | '인생성장'

function buildContentDisposition(name: string): string {
  const safeName = name.replace(/[\\/:*?"<>|]/g, '').trim() || '사용자'
  const filename = `천명_프리미엄_리포트_${safeName}.docx`
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
    .select('id, form_data, saju_data, report_content')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '리포트를 찾을 수 없습니다.' }, { status: 404 })
  }

  const interpretations = (data.report_content ?? {}) as Partial<Record<Category, string>>
  const formData = (data.form_data ?? {}) as Record<string, unknown>
  const sajuData = data.saju_data

  const buffer = await generatePremiumReport(formData, sajuData, interpretations)
  const fileNameSource = typeof formData.name === 'string' ? formData.name : '사용자'

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': buildContentDisposition(fileNameSource),
      'Cache-Control': 'no-store',
    },
  })
}
