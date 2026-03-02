/**
 * 다국어 지원 (i18n) 모듈
 * 한국어 / English / 中文 지원
 */

export type Locale = 'ko' | 'en' | 'zh'

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
}

type TranslationKey =
  | 'app.title'
  | 'app.subtitle'
  | 'app.description'
  | 'form.title'
  | 'form.description'
  | 'form.year'
  | 'form.month'
  | 'form.day'
  | 'form.hour'
  | 'form.minute'
  | 'form.solar'
  | 'form.lunar'
  | 'form.leapMonth'
  | 'form.male'
  | 'form.female'
  | 'form.submit'
  | 'form.analyzing'
  | 'result.saju'
  | 'result.oheng'
  | 'result.sipsin'
  | 'result.ilganStrength'
  | 'result.yongsin'
  | 'result.daeun'
  | 'result.fortune'
  | 'result.aiInterpretation'
  | 'result.reset'
  | 'result.share'
  | 'result.saveImage'
  | 'result.savingImage'
  | 'result.linkCopied'
  | 'result.followUp.placeholder'
  | 'result.followUp.send'
  | 'result.gunghap'
  | 'result.gunghapLink'
  | 'result.backToSaju'
  | 'category.overall'
  | 'category.personality'
  | 'category.love'
  | 'category.career'
  | 'category.health'
  | 'category.wealth'
  | 'error.network'
  | 'error.aiError'
  | 'error.calcError'
  | 'error.streamNotSupported'
  | 'error.unexpected'
  | 'error.refresh'
  | 'ilgan.strong'
  | 'ilgan.weak'
  | 'ilgan.support'
  | 'ilgan.opposition'
  | 'ilgan.monthHelps'
  | 'ilgan.monthResists'
  | 'yongsin.yongsin'
  | 'yongsin.huisin'
  | 'yongsin.favorable'
  | 'yongsin.unfavorable'
  | 'daeun.direction'
  | 'daeun.forward'
  | 'daeun.reverse'
  | 'daeun.startAge'
  | 'fortune.yearly'
  | 'fortune.monthly'
  | 'fortune.good'
  | 'fortune.neutral'
  | 'fortune.bad'

const ko: Record<TranslationKey, string> = {
  'app.title': '천명',
  'app.subtitle': '天命',
  'app.description': '나의 사주팔자 풀이',
  'form.title': '천명',
  'form.description': '생년월일시를 입력해 주세요',
  'form.year': '연도 (年)',
  'form.month': '월 (月)',
  'form.day': '일 (日)',
  'form.hour': '시 (時)',
  'form.minute': '분 (分)',
  'form.solar': '양력 (陽曆)',
  'form.lunar': '음력 (陰曆)',
  'form.leapMonth': '윤달 (閏月)',
  'form.male': '남성 (男)',
  'form.female': '여성 (女)',
  'form.submit': '사주 풀이 보기',
  'form.analyzing': '분석 중...',
  'result.saju': '사주팔자',
  'result.oheng': '오행 분포',
  'result.sipsin': '십신 분석',
  'result.ilganStrength': '일간 강약',
  'result.yongsin': '용신 · 희신',
  'result.daeun': '대운 흐름',
  'result.fortune': '세운 · 월운',
  'result.aiInterpretation': 'AI 사주 해석',
  'result.reset': '다시 보기',
  'result.share': '링크 복사',
  'result.saveImage': '이미지 저장',
  'result.savingImage': '저장 중...',
  'result.linkCopied': '링크가 복사되었습니다!',
  'result.followUp.placeholder': '추가 질문을 입력하세요...',
  'result.followUp.send': '물어보기',
  'result.gunghap': '궁합 보기',
  'result.gunghapLink': '궁합 비교하러 가기',
  'result.backToSaju': '개인 사주 보러 가기',
  'category.overall': '종합',
  'category.personality': '성격',
  'category.love': '연애',
  'category.career': '직업',
  'category.health': '건강',
  'category.wealth': '재물',
  'error.network': '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  'error.aiError': 'AI 해석 중 오류가 발생했습니다.',
  'error.calcError': '사주 계산 중 오류가 발생했습니다.',
  'error.streamNotSupported': '스트리밍을 지원하지 않는 환경입니다.',
  'error.unexpected': '예기치 않은 오류가 발생했습니다.',
  'error.refresh': '새로고침',
  'ilgan.strong': '신강',
  'ilgan.weak': '신약',
  'ilgan.support': '도움 (비겁+인성)',
  'ilgan.opposition': '억제 (식상+재관)',
  'ilgan.monthHelps': '일간을 도움',
  'ilgan.monthResists': '일간을 억제',
  'yongsin.yongsin': '용신 (用神)',
  'yongsin.huisin': '희신 (喜神)',
  'yongsin.favorable': '유리한 오행',
  'yongsin.unfavorable': '불리한 오행',
  'daeun.direction': '방향',
  'daeun.forward': '순행',
  'daeun.reverse': '역행',
  'daeun.startAge': '시작',
  'fortune.yearly': '세운',
  'fortune.monthly': '월운',
  'fortune.good': '길 吉',
  'fortune.neutral': '평 平',
  'fortune.bad': '흉 凶',
}

const en: Record<TranslationKey, string> = {
  'app.title': 'Cheonmyeong',
  'app.subtitle': '天命',
  'app.description': 'Your Four Pillars Reading',
  'form.title': 'Cheonmyeong',
  'form.description': 'Enter your birth date and time',
  'form.year': 'Year',
  'form.month': 'Month',
  'form.day': 'Day',
  'form.hour': 'Hour',
  'form.minute': 'Minute',
  'form.solar': 'Solar',
  'form.lunar': 'Lunar',
  'form.leapMonth': 'Leap Month',
  'form.male': 'Male',
  'form.female': 'Female',
  'form.submit': 'Read My Fortune',
  'form.analyzing': 'Analyzing...',
  'result.saju': 'Four Pillars',
  'result.oheng': 'Five Elements',
  'result.sipsin': 'Ten Gods',
  'result.ilganStrength': 'Day Master Strength',
  'result.yongsin': 'Favorable Element',
  'result.daeun': 'Luck Cycles',
  'result.fortune': 'Year & Month Fortune',
  'result.aiInterpretation': 'AI Interpretation',
  'result.reset': 'Start Over',
  'result.share': 'Copy Link',
  'result.saveImage': 'Save Image',
  'result.savingImage': 'Saving...',
  'result.linkCopied': 'Link copied!',
  'result.followUp.placeholder': 'Ask a follow-up question...',
  'result.followUp.send': 'Ask',
  'result.gunghap': 'Compatibility',
  'result.gunghapLink': 'Check Compatibility',
  'result.backToSaju': 'Personal Reading',
  'category.overall': 'Overall',
  'category.personality': 'Personality',
  'category.love': 'Love',
  'category.career': 'Career',
  'category.health': 'Health',
  'category.wealth': 'Wealth',
  'error.network': 'Network error. Please try again later.',
  'error.aiError': 'AI interpretation error.',
  'error.calcError': 'Calculation error.',
  'error.streamNotSupported': 'Streaming not supported.',
  'error.unexpected': 'An unexpected error occurred.',
  'error.refresh': 'Refresh',
  'ilgan.strong': 'Strong',
  'ilgan.weak': 'Weak',
  'ilgan.support': 'Support',
  'ilgan.opposition': 'Opposition',
  'ilgan.monthHelps': 'Month supports Day Master',
  'ilgan.monthResists': 'Month opposes Day Master',
  'yongsin.yongsin': 'Yongsin (用神)',
  'yongsin.huisin': 'Huisin (喜神)',
  'yongsin.favorable': 'Favorable',
  'yongsin.unfavorable': 'Unfavorable',
  'daeun.direction': 'Direction',
  'daeun.forward': 'Forward',
  'daeun.reverse': 'Reverse',
  'daeun.startAge': 'Start',
  'fortune.yearly': 'Year',
  'fortune.monthly': 'Month',
  'fortune.good': 'Good',
  'fortune.neutral': 'Neutral',
  'fortune.bad': 'Caution',
}

const zh: Record<TranslationKey, string> = {
  'app.title': '天命',
  'app.subtitle': '天命',
  'app.description': '我的四柱八字解析',
  'form.title': '天命',
  'form.description': '请输入出生日期和时间',
  'form.year': '年',
  'form.month': '月',
  'form.day': '日',
  'form.hour': '时',
  'form.minute': '分',
  'form.solar': '阳历',
  'form.lunar': '阴历',
  'form.leapMonth': '闰月',
  'form.male': '男',
  'form.female': '女',
  'form.submit': '查看八字',
  'form.analyzing': '分析中...',
  'result.saju': '四柱八字',
  'result.oheng': '五行分布',
  'result.sipsin': '十神分析',
  'result.ilganStrength': '日干强弱',
  'result.yongsin': '用神·喜神',
  'result.daeun': '大运流程',
  'result.fortune': '岁运·月运',
  'result.aiInterpretation': 'AI八字解读',
  'result.reset': '重新查看',
  'result.share': '复制链接',
  'result.saveImage': '保存图片',
  'result.savingImage': '保存中...',
  'result.linkCopied': '链接已复制！',
  'result.followUp.placeholder': '请输入追加问题...',
  'result.followUp.send': '提问',
  'result.gunghap': '合婚',
  'result.gunghapLink': '查看合婚',
  'result.backToSaju': '个人八字',
  'category.overall': '综合',
  'category.personality': '性格',
  'category.love': '恋爱',
  'category.career': '事业',
  'category.health': '健康',
  'category.wealth': '财运',
  'error.network': '网络错误，请稍后再试。',
  'error.aiError': 'AI解读错误。',
  'error.calcError': '计算错误。',
  'error.streamNotSupported': '不支持流式传输。',
  'error.unexpected': '发生意外错误。',
  'error.refresh': '刷新',
  'ilgan.strong': '身强',
  'ilgan.weak': '身弱',
  'ilgan.support': '助力',
  'ilgan.opposition': '抑制',
  'ilgan.monthHelps': '月令助日干',
  'ilgan.monthResists': '月令制日干',
  'yongsin.yongsin': '用神',
  'yongsin.huisin': '喜神',
  'yongsin.favorable': '有利五行',
  'yongsin.unfavorable': '不利五行',
  'daeun.direction': '方向',
  'daeun.forward': '顺行',
  'daeun.reverse': '逆行',
  'daeun.startAge': '起运',
  'fortune.yearly': '岁运',
  'fortune.monthly': '月运',
  'fortune.good': '吉',
  'fortune.neutral': '平',
  'fortune.bad': '凶',
}

const translations: Record<Locale, Record<TranslationKey, string>> = { ko, en, zh }

/**
 * 번역 함수
 * @param locale 현재 로케일
 * @param key 번역 키
 * @returns 번역된 문자열
 */
export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale]?.[key] ?? translations['ko'][key] ?? key
}

/**
 * 브라우저 기본 언어 감지
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'ko'
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('zh')) return 'zh'
  if (lang.startsWith('en')) return 'en'
  return 'ko'
}
