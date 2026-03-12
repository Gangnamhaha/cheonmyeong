import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  Paragraph,
  TableOfContents,
  TextRun,
} from 'docx'
import type { GunghapResult } from '@/lib/gunghap'

type PremiumCategory = '종합' | '성격' | '연애' | '직업' | '건강' | '재물' | '인생성장'
type ProCategory = PremiumCategory | '대운 분석' | '세운 전망 (2025-2027)' | '인생 통합 조언'
type GunghapReportCategory = '궁합총평' | '성격궁합' | '연애궁합' | '직장궁합' | '관계조언'

const CATEGORY_ORDER: PremiumCategory[] = ['종합', '성격', '연애', '직업', '건강', '재물', '인생성장']
const GUNGHAP_CATEGORY_ORDER: GunghapReportCategory[] = ['궁합총평', '성격궁합', '연애궁합', '직장궁합', '관계조언']

type FormDataLike = {
  name?: string
  year?: number
  month?: number
  day?: number
  hour?: number
  minute?: number
  gender?: string
  calendarType?: string
}

type DaeunTimelinePeriod = {
  stem: string
  branch: string
  stemHanja?: string
  branchHanja?: string
  element?: string
  startAge: number
  endAge: number
}

type SajuDataLike = {
  daeun?: {
    periods?: DaeunTimelinePeriod[]
  }
}

function buildIntroSections(formData: FormDataLike, title: string, tocTitle: string): Paragraph[] {
  const name = formData?.name ?? '사용자'
  const birthInfo = [
    formData?.year,
    formData?.month,
    formData?.day,
  ].every((v) => typeof v === 'number')
    ? `${formData.year}년 ${formData.month}월 ${formData.day}일`
    : '생년월일 정보 없음'
  const timeInfo = typeof formData?.hour === 'number'
    ? `${formData.hour}시${typeof formData?.minute === 'number' ? ` ${formData.minute}분` : ''}`
    : '출생시 정보 없음'
  const genderInfo = formData?.gender === 'male' ? '남성' : formData?.gender === 'female' ? '여성' : '성별 정보 없음'
  const calendarInfo = formData?.calendarType === 'lunar' ? '음력' : '양력'

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: title, bold: true, size: 44 })],
      spacing: { after: 320 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${name} 님`, size: 30, bold: true })],
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${birthInfo} ${timeInfo} (${calendarInfo}, ${genderInfo})`, size: 24 })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `생성일: ${new Date().toISOString().slice(0, 10)}`, size: 20, color: '666666' })],
      pageBreakBefore: false,
    }),
    new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.HEADING_1, text: '목차' }),
    new Paragraph({
      children: [
        new TableOfContents(tocTitle, {
          hyperlink: true,
          headingStyleRange: '1-2',
        }),
      ],
      spacing: { after: 240 },
    }),
  ]
}

function buildCategorySection(title: string, content: string): Paragraph[] {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      text: title,
      pageBreakBefore: true,
    }),
    ...content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => new Paragraph({
        children: [new TextRun({ text: line, size: 22 })],
        spacing: { after: 100 },
      })),
  ]
}

function extractDaeunPeriods(sajuData: unknown): DaeunTimelinePeriod[] {
  if (!sajuData || typeof sajuData !== 'object') return []
  const typed = sajuData as SajuDataLike
  if (!Array.isArray(typed.daeun?.periods)) return []
  return typed.daeun.periods.filter((period) => (
    typeof period.startAge === 'number'
    && typeof period.endAge === 'number'
    && typeof period.stem === 'string'
    && typeof period.branch === 'string'
  ))
}

export async function generateGunghapReport(
  person1Data: FormDataLike,
  person2Data: FormDataLike,
  gunghapResult: GunghapResult,
  interpretations: Partial<Record<GunghapReportCategory, string>>,
): Promise<Buffer> {
  const formatPersonInfo = (person: FormDataLike, fallbackName: string): string => {
    const name = person.name?.trim() || fallbackName
    const birthInfo = [person.year, person.month, person.day].every((v) => typeof v === 'number')
      ? `${person.year}년 ${person.month}월 ${person.day}일`
      : '생년월일 정보 없음'
    const genderInfo = person.gender === 'male' ? '남성' : person.gender === 'female' ? '여성' : '성별 정보 없음'
    return `${name} | ${birthInfo} | ${genderInfo}`
  }

  const sections: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: '사주해 궁합 분석 리포트', bold: true, size: 44 })],
      spacing: { after: 280 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: formatPersonInfo(person1Data, '첫 번째 사람'), size: 24 })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: formatPersonInfo(person2Data, '두 번째 사람'), size: 24 })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `생성일: ${new Date().toISOString().slice(0, 10)}`, size: 20, color: '666666' })],
      spacing: { after: 160 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `궁합 종합 점수: ${gunghapResult.score} / 100`, bold: true, size: 28 })],
      spacing: { after: 140 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `- 성격 궁합: ${gunghapResult.categories.personality.score}점`, size: 22 }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `- 연애 궁합: ${gunghapResult.categories.love.score}점`, size: 22 }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `- 직장 궁합: ${gunghapResult.categories.work.score}점`, size: 22 }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `- 건강 궁합: ${gunghapResult.categories.health.score}점`, size: 22 }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `오행 보완: ${gunghapResult.ohengBalance}`, size: 22 })],
      spacing: { after: 140 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `총평: ${gunghapResult.categories.overall}`, size: 22 })],
      spacing: { after: 120 },
    }),
  ]

  for (const category of GUNGHAP_CATEGORY_ORDER) {
    const content = interpretations[category] ?? '생성된 해석이 없습니다.'
    sections.push(...buildCategorySection(category, content))
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Malgun Gothic' } },
        title: { run: { font: 'Malgun Gothic' } },
        heading1: { run: { font: 'Malgun Gothic' } },
        heading2: { run: { font: 'Malgun Gothic' } },
      },
    },
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '사주해 AI 사주팔자 분석 서비스 | sajuhae.vercel.app',
                    size: 18,
                    color: '777777',
                  }),
                ],
              }),
            ],
          }),
        },
        children: sections,
      },
    ],
  })

  return Packer.toBuffer(doc)
}

export async function generatePremiumReport(
  formData: FormDataLike,
  sajuData: unknown,
  interpretations: Partial<Record<PremiumCategory, string>>,
): Promise<Buffer> {
  const sections: Paragraph[] = buildIntroSections(
    formData,
    '사주해 프리미엄 사주 분석 리포트',
    '프리미엄 리포트 목차',
  )

  for (const category of CATEGORY_ORDER) {
    const content = interpretations[category] ?? '생성된 해석이 없습니다.'
    sections.push(...buildCategorySection(category, content))
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Malgun Gothic' } },
        title: { run: { font: 'Malgun Gothic' } },
        heading1: { run: { font: 'Malgun Gothic' } },
        heading2: { run: { font: 'Malgun Gothic' } },
      },
    },
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '사주해 AI 사주팔자 분석 서비스 | sajuhae.vercel.app',
                    size: 18,
                    color: '777777',
                  }),
                ],
              }),
            ],
          }),
        },
        children: sections,
      },
    ],
  })

  void sajuData
  return Packer.toBuffer(doc)
}

export async function generateProReport(
  formData: FormDataLike,
  sajuData: unknown,
  interpretations: Partial<Record<ProCategory, string>>,
  options?: {
    daeunInterpretation?: string
    seunInterpretation?: string
    lifeAdvice?: string
  },
): Promise<Buffer> {
  const sections: Paragraph[] = buildIntroSections(
    formData,
    '사주해 프로페셔널 사주 분석 리포트',
    '프로페셔널 리포트 목차',
  )

  for (const category of CATEGORY_ORDER) {
    const content = interpretations[category] ?? '생성된 해석이 없습니다.'
    sections.push(...buildCategorySection(category, content))
  }

  const daeunPeriods = extractDaeunPeriods(sajuData)
  const daeunInterpretation = options?.daeunInterpretation ?? interpretations['대운 분석'] ?? '생성된 해석이 없습니다.'
  sections.push(
    new Paragraph({ heading: HeadingLevel.HEADING_1, text: '대운 분석', pageBreakBefore: true }),
    new Paragraph({
      children: [new TextRun({ text: '대운 10년 타임라인', bold: true, size: 24 })],
      spacing: { after: 120 },
    }),
  )

  if (daeunPeriods.length > 0) {
    for (const period of daeunPeriods) {
      const label = `${period.startAge}~${period.endAge}세`
      const pillar = `${period.stem}${period.branch}`
      const hanja = `${period.stemHanja ?? ''}${period.branchHanja ?? ''}`
      const detail = `${pillar}${hanja ? ` (${hanja})` : ''} / 오행 ${period.element ?? '-'}`
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${label}: `, bold: true, size: 22 }),
            new TextRun({ text: detail, size: 22 }),
          ],
          spacing: { after: 80 },
        }),
      )
    }
  } else {
    sections.push(new Paragraph({ children: [new TextRun({ text: '대운 타임라인 정보가 없습니다.', size: 22 })], spacing: { after: 80 } }))
  }

  sections.push(...buildCategorySection('대운 해석', daeunInterpretation))

  const seunInterpretation = options?.seunInterpretation ?? interpretations['세운 전망 (2025-2027)'] ?? '생성된 해석이 없습니다.'
  sections.push(...buildCategorySection('세운 전망 (2025-2027)', seunInterpretation))

  const lifeAdvice = options?.lifeAdvice ?? interpretations['인생 통합 조언'] ?? '생성된 해석이 없습니다.'
  sections.push(...buildCategorySection('인생 통합 조언', lifeAdvice))

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Malgun Gothic' } },
        title: { run: { font: 'Malgun Gothic' } },
        heading1: { run: { font: 'Malgun Gothic' } },
        heading2: { run: { font: 'Malgun Gothic' } },
      },
    },
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '사주해 AI 사주팔자 분석 서비스 | sajuhae.vercel.app',
                    size: 18,
                    color: '777777',
                  }),
                ],
              }),
            ],
          }),
        },
        children: sections,
      },
    ],
  })

  return Packer.toBuffer(doc)
}
