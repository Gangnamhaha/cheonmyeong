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

type PremiumCategory = '종합' | '성격' | '연애' | '직업' | '건강' | '재물' | '인생성장'

const CATEGORY_ORDER: PremiumCategory[] = ['종합', '성격', '연애', '직업', '건강', '재물', '인생성장']

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

export async function generatePremiumReport(
  formData: FormDataLike,
  sajuData: unknown,
  interpretations: Partial<Record<PremiumCategory, string>>,
): Promise<Buffer> {
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

  const sections: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: '천명(天命) 프리미엄 사주 분석 리포트', bold: true, size: 44 })],
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
        new TableOfContents('프리미엄 리포트 목차', {
          hyperlink: true,
          headingStyleRange: '1-2',
        }),
      ],
      spacing: { after: 240 },
    }),
  ]

  for (const category of CATEGORY_ORDER) {
    const content = interpretations[category] ?? '생성된 해석이 없습니다.'
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: category,
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
    )
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
                    text: '천명(天命) AI 사주팔자 분석 서비스 | cheonmyeong.vercel.app',
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
