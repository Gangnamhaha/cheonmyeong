type ZodiacAnimalEntry = {
  slug: string
  korean: string
  icon: string
  aliases?: readonly string[]
}

export const ZODIAC_ANIMALS = [
  { slug: 'rat', korean: '쥐', icon: '🐭' },
  { slug: 'ox', korean: '소', icon: '🐮' },
  { slug: 'tiger', korean: '호랑이', icon: '🐯' },
  { slug: 'rabbit', korean: '토끼', icon: '🐰' },
  { slug: 'dragon', korean: '용', icon: '🐲' },
  { slug: 'snake', korean: '뱀', icon: '🐍' },
  { slug: 'horse', korean: '말', icon: '🐴' },
  { slug: 'goat', korean: '양', icon: '🐑', aliases: ['sheep'] },
  { slug: 'monkey', korean: '원숭이', icon: '🐵' },
  { slug: 'rooster', korean: '닭', icon: '🐔' },
  { slug: 'dog', korean: '개', icon: '🐶' },
  { slug: 'pig', korean: '돼지', icon: '🐷' },
] as const satisfies readonly ZodiacAnimalEntry[]

export const FORTUNE_TOPICS = [
  { slug: 'jaemulun', korean: '재물운', headline: '돈의 흐름과 지출 습관을 점검하는 운세' },
  { slug: 'yeonaewun', korean: '연애운', headline: '인연, 감정 흐름, 관계의 성장을 보는 운세' },
  { slug: 'chwieobun', korean: '취업운', headline: '직장, 이직, 승진, 기회 타이밍을 읽는 운세' },
] as const

export type ZodiacAnimal = (typeof ZODIAC_ANIMALS)[number]
export type ZodiacAnimalSlug = ZodiacAnimal['slug']
export type FortuneTopic = (typeof FORTUNE_TOPICS)[number]
export type FortuneTopicSlug = FortuneTopic['slug']

type AnimalGuide = {
  temperament: string
  strength: string
  caution: string
  routine: string
  peopleTip: string
  timing: string
}

const ANIMAL_GUIDE: Record<ZodiacAnimalSlug, AnimalGuide> = {
  rat: {
    temperament: '빠른 판단과 정보 감각이 뛰어나 작은 변화도 먼저 포착합니다.',
    strength: '숫자를 보는 감각이 좋아 수입 구조를 세밀하게 조정하는 힘이 있습니다.',
    caution: '불안할수록 결정을 서두르는 경향이 있어 계약 전 재확인이 필요합니다.',
    routine: '하루 15분 지출 점검과 주간 계획표 작성이 운을 안정시킵니다.',
    peopleTip: '실무형 조력자와 손잡을 때 성과가 더 빠르게 나타납니다.',
    timing: '상반기에는 정리, 하반기에는 확장 전략이 특히 유리합니다.',
  },
  ox: {
    temperament: '꾸준함과 인내력이 강해 느려 보여도 끝까지 완성해 냅니다.',
    strength: '기초 체력을 다지는 능력이 탁월해 장기전에서 반드시 결과를 만듭니다.',
    caution: '완벽주의 때문에 좋은 기회를 늦게 잡을 수 있어 첫 실행 시점을 정해 두는 것이 좋습니다.',
    routine: '월별 목표를 주간 단위로 쪼개 관리하면 부담이 크게 줄어듭니다.',
    peopleTip: '현실적인 조언을 주는 선배형 인맥이 큰 길잡이가 됩니다.',
    timing: '3분기 이후 보상 운이 강해져 누적한 노력이 빛을 봅니다.',
  },
  tiger: {
    temperament: '도전 본능과 추진력이 강해 판이 바뀌는 시기에 특히 강합니다.',
    strength: '새로운 기회를 현실 성과로 바꾸는 속도가 빨라 존재감이 커집니다.',
    caution: '속도에 비해 검토가 부족하면 작은 실수가 비용으로 커질 수 있습니다.',
    routine: '중요 의사결정은 하루 숙성 후 확정하는 습관이 리스크를 줄입니다.',
    peopleTip: '대담함을 이해해 주는 파트너와 협업할 때 상승폭이 큽니다.',
    timing: '상반기 도전, 하반기 수확의 리듬을 타면 안정적입니다.',
  },
  rabbit: {
    temperament: '섬세한 감수성과 조율 능력으로 주변 분위기를 편안하게 만듭니다.',
    strength: '갈등 상황을 부드럽게 정리하는 힘이 있어 관계 자산이 큽니다.',
    caution: '배려가 과하면 본인 에너지가 소진되므로 경계선을 분명히 해야 합니다.',
    routine: '하루 시작 전 우선순위 3가지를 적는 습관이 집중력을 높입니다.',
    peopleTip: '감정 소통이 정확한 사람과 함께할 때 마음과 성과가 동시에 좋아집니다.',
    timing: '중반 이후 준비해 둔 일이 자연스럽게 확장됩니다.',
  },
  dragon: {
    temperament: '존재감과 리더십이 강해 사람과 자원을 모으는 힘이 좋습니다.',
    strength: '판단과 결단이 빠르며 큰 방향을 세우는 능력이 탁월합니다.',
    caution: '강한 자신감이 디테일 누락으로 이어지지 않도록 점검 루틴이 필요합니다.',
    routine: '주 1회 성과 리뷰와 리스크 체크를 병행하면 효율이 올라갑니다.',
    peopleTip: '실행력이 뛰어난 동료와 손잡으면 계획이 빠르게 현실화됩니다.',
    timing: '하반기로 갈수록 금전과 평판 흐름이 함께 상승합니다.',
  },
  snake: {
    temperament: '관찰력과 통찰력이 깊어 복잡한 문제를 정리하는 데 강점이 있습니다.',
    strength: '정보를 구조화해 전략으로 바꾸는 능력이 뛰어납니다.',
    caution: '생각이 깊어 실행이 늦어질 수 있으니 마감 기준을 먼저 정해야 합니다.',
    routine: '아침 루틴을 일정하게 유지하면 집중력과 컨디션이 동시에 좋아집니다.',
    peopleTip: '신뢰 중심의 소수 네트워크가 큰 기회를 연결해 줍니다.',
    timing: '2분기부터 흐름이 붙고 4분기에 결과가 선명해집니다.',
  },
  horse: {
    temperament: '활동 반경이 넓고 에너지가 높아 변화 국면에서 빛이 납니다.',
    strength: '새로운 환경 적응이 빨라 시장 변화에 즉시 대응할 수 있습니다.',
    caution: '순간의 흥분으로 지출이나 일정이 과열되지 않게 조절이 필요합니다.',
    routine: '주간 휴식 블록을 먼저 고정하면 과로를 크게 줄일 수 있습니다.',
    peopleTip: '속도감 있는 팀과 호흡할 때 실적이 눈에 띄게 올라갑니다.',
    timing: '여름 이후 성과 가시성이 커지며 평판 운도 함께 상승합니다.',
  },
  goat: {
    temperament: '따뜻한 공감력과 안정 지향 성향으로 신뢰를 천천히 쌓아 갑니다.',
    strength: '관계의 결을 읽는 능력이 좋아 협업과 조정 역할에서 강합니다.',
    caution: '남을 먼저 챙기다 본인 계획이 늦어질 수 있어 일정 경계가 중요합니다.',
    routine: '하루 마감 회고를 10분만 해도 흐름 관리가 훨씬 수월해집니다.',
    peopleTip: '정서적으로 안정적인 파트너와 함께하면 운의 기복이 줄어듭니다.',
    timing: '초반 준비, 후반 실속 수확의 패턴이 선명하게 나타납니다.',
  },
  monkey: {
    temperament: '아이디어가 풍부하고 실행 전환이 빨라 기회를 잘 만듭니다.',
    strength: '새로운 도구와 환경에 빠르게 적응해 생산성을 높입니다.',
    caution: '동시에 여러 일을 벌리면 마감이 흔들릴 수 있어 선택과 집중이 필요합니다.',
    routine: '업무를 90분 집중 블록으로 나누면 성과 편차가 줄어듭니다.',
    peopleTip: '피드백이 빠른 조직에서 실력이 크게 성장합니다.',
    timing: '중반에 확장 기회가 열리고 연말에 수익화가 강해집니다.',
  },
  rooster: {
    temperament: '기준이 분명하고 완성도를 중시해 신뢰도 높은 결과를 냅니다.',
    strength: '세부 품질 관리가 뛰어나 평가, 심사, 계약 단계에서 강합니다.',
    caution: '자기검열이 심해 공개 시점을 늦추지 않도록 기준을 단순화해야 합니다.',
    routine: '하루 시작 체크리스트 5개만 지켜도 효율이 크게 오릅니다.',
    peopleTip: '정확성을 중시하는 동료와 협업하면 시너지가 큽니다.',
    timing: '하반기 평판 보상 운이 강해 승진과 계약에 유리합니다.',
  },
  dog: {
    temperament: '책임감이 강하고 원칙을 지켜 주변의 신뢰를 얻습니다.',
    strength: '맡은 일을 끝까지 지키는 성향 덕분에 중요한 기회가 자주 들어옵니다.',
    caution: '의무감으로 과부하가 생기기 쉬우니 역할 경계를 분명히 해야 합니다.',
    routine: '주 2회 운동과 수면 고정 시간만 지켜도 운의 체감이 달라집니다.',
    peopleTip: '약속을 지키는 사람들과의 장기 협업이 큰 재산이 됩니다.',
    timing: '가을 이후 누적 보상이 빠르게 반영되는 흐름입니다.',
  },
  pig: {
    temperament: '여유와 낙관을 바탕으로 사람을 모으고 기회를 연결합니다.',
    strength: '새로운 배움과 확장에 열린 태도로 성장 속도를 높입니다.',
    caution: '편안함에 머무르면 타이밍을 놓칠 수 있어 실행 일정을 명확히 해야 합니다.',
    routine: '자동저축과 주간 공부 루틴을 병행하면 운의 밀도가 높아집니다.',
    peopleTip: '취향과 가치관이 맞는 인맥이 핵심 기회를 열어 줍니다.',
    timing: '상반기 준비가 하반기 수익과 평가로 연결됩니다.',
  },
}

type TopicBreakdown = {
  title: string
  description: string
}

const TOPIC_BREAKDOWN: Record<FortuneTopicSlug, TopicBreakdown[]> = {
  jaemulun: [
    { title: '투자운', description: '분산과 검증을 우선하면 수익의 안정성이 크게 높아집니다.' },
    { title: '사업운', description: '현금흐름을 먼저 설계하면 확장 속도와 지속성이 함께 올라갑니다.' },
    { title: '부동산운', description: '급한 매수보다 장기 가치와 생활 동선을 함께 보는 판단이 유리합니다.' },
  ],
  yeonaewun: [
    { title: '인연운', description: '소개, 모임, 일상 루틴 안에서 자연스럽게 좋은 인연이 들어옵니다.' },
    { title: '관계운', description: '대화의 타이밍을 맞추면 오해가 줄고 신뢰가 빠르게 깊어집니다.' },
    { title: '결혼운', description: '현실 조건과 감정 균형을 함께 볼 때 안정적인 선택이 가능합니다.' },
  ],
  chwieobun: [
    { title: '취업운', description: '포지션 맞춤 지원 전략이 합격 확률과 면접 완성도를 끌어올립니다.' },
    { title: '이직운', description: '타이밍보다 방향이 중요하며 역량 포트폴리오가 결정적 역할을 합니다.' },
    { title: '승진운', description: '성과 기록과 관계 관리가 함께 갈 때 평가 점수가 크게 상승합니다.' },
  ],
}

function buildJaemulunText(animal: ZodiacAnimal, guide: AnimalGuide) {
  return `${animal.korean}띠의 2026년 재물운은 눈에 보이는 수입보다 돈이 머무는 구조를 어떻게 만들 것인가에 초점이 맞춰집니다. ${guide.temperament} 그래서 한 번의 큰 수익보다 꾸준히 남는 구조를 세우는 사람이 결국 웃게 됩니다. 올해는 특히 소비 습관을 바꾸는 힘이 강하게 들어오며, 카드값과 생활비처럼 반복 지출을 정리하면 하반기 체감 여유가 크게 늘어납니다. ${guide.strength} 때문에 부업, 성과급, 프로젝트 수입처럼 복수의 수익원을 연결할수록 재물운의 폭이 넓어집니다.

투자운에서는 조급함을 내려놓고 검증의 시간을 확보하는 것이 핵심입니다. 시장이 흔들릴 때 감정적으로 진입하면 수익보다 피로가 먼저 쌓입니다. 반대로 목표 수익률과 손절 기준을 미리 정해 두면 작은 변동에도 중심을 잃지 않습니다. ${guide.caution} 계약, 세금, 수수료, 해지 조건을 꼼꼼히 읽는 습관이 곧 실전 방패가 됩니다. 사업운은 과감한 확장보다 현금흐름표를 먼저 정리하는 쪽이 더 강합니다. 매출이 늘어도 고정비가 과하면 손에 남는 돈이 줄어들기 때문에 인건비, 광고비, 운영비를 월 단위로 분리해 관리하는 방식이 유리합니다.

부동산운은 단기 시세보다 거주 편의, 유지비, 대출 상환 리듬을 함께 따질 때 길합니다. 집은 자산이면서 생활의 기반이므로 숫자와 감정을 동시에 점검해야 합니다. ${guide.routine}처럼 루틴을 유지하면 재물 운의 기복이 확실히 줄어듭니다. 사람운도 중요합니다. ${guide.peopleTip} 재정 상담, 세무 조언, 실무형 피드백을 받아 의사결정의 정확도를 높이세요. ${guide.timing} 마지막으로 올해 재물운의 열쇠는 절약 자체가 아니라 목적 있는 지출입니다. 미래의 나를 키우는 배움, 건강, 도구에 쓰는 돈은 오히려 운을 확장시키는 투자로 작동합니다.`
}

function buildYeonaewunText(animal: ZodiacAnimal, guide: AnimalGuide) {
  return `${animal.korean}띠의 2026년 연애운은 감정의 온도와 현실의 균형을 맞추는 과정에서 크게 성장합니다. ${guide.temperament} 성향 덕분에 상대의 마음을 빨리 읽지만, 올해는 읽는 것에 그치지 않고 정확하게 표현하는 연습이 관계의 깊이를 결정합니다. 싱글이라면 갑작스러운 강한 인연보다 일상에서 자주 마주치는 사람과의 서서히 깊어지는 흐름이 더 안정적입니다. 이미 관계가 있는 경우에는 사소한 일정 공유와 생활 리듬 조율이 애정의 신뢰도를 높여 줍니다.

인연운은 봄과 초여름에 활발하며, 소개나 모임, 취미 커뮤니티에서 마음이 통하는 사람을 만나기 쉽습니다. 다만 첫인상만으로 판단하면 아쉬움이 남을 수 있으니 대화의 결을 충분히 확인하세요. ${guide.strength} 덕분에 따뜻한 배려를 실천하면 상대가 빠르게 마음을 엽니다. 관계운에서는 말투와 타이밍이 가장 큰 변수입니다. 피곤한 상태에서 결론부터 말하면 오해가 생기기 쉬우니, 감정 설명-사실 확인-해결 제안의 순서로 대화하면 충돌이 줄어듭니다. ${guide.caution}을 기억하면 반복 갈등을 상당히 줄일 수 있습니다.

결혼운은 연말로 갈수록 현실 검토가 본격화됩니다. 양가 분위기, 재정 계획, 주거 계획처럼 구체적인 항목을 하나씩 합의하면 불안이 기대감으로 바뀝니다. 연애는 감정으로 시작하지만 신뢰는 습관으로 완성됩니다. ${guide.routine} 같은 생활 루틴이 두 사람의 안정감을 키워 줍니다. 또한 ${guide.peopleTip}라는 흐름처럼 관계를 지지해 주는 건강한 주변 인맥이 중요합니다. ${guide.timing} 올해 연애운의 핵심은 완벽한 상대를 찾는 것이 아니라, 함께 성장할 수 있는 리듬을 만드는 데 있습니다. 진심 어린 칭찬, 명확한 약속, 작은 배려를 꾸준히 반복하면 좋은 인연은 오래 남고 흔들리던 관계도 단단해집니다.`
}

function buildChwieobunText(animal: ZodiacAnimal, guide: AnimalGuide) {
  return `${animal.korean}띠의 2026년 취업운은 준비된 사람에게 기회가 몰리는 전형적인 상승 흐름입니다. ${guide.temperament} 덕분에 변화 신호를 빠르게 읽을 수 있으므로, 채용 공고를 기다리기보다 먼저 역량 포트폴리오를 정리하는 전략이 유효합니다. 올해는 지원 개수보다 포지션 적합도가 훨씬 중요합니다. 이력서 한 장을 여러 곳에 뿌리기보다 직무별 성과 문장을 맞춤 수정하면 면접 전환율이 크게 높아집니다. ${guide.strength}이 강하게 작동하는 시기라 자기소개서에서 문제 해결 경험을 숫자로 보여 주면 신뢰가 빠르게 생깁니다.

취업운에서는 상반기 준비, 하반기 결과의 패턴이 선명합니다. 상반기에는 자격증, 포트폴리오, 실무 툴 숙련도를 올리며 기반을 다지고, 하반기에는 면접과 협상에서 존재감이 커집니다. 이직운은 연봉보다 성장 경로를 함께 봐야 길합니다. 지금의 피로를 피하려는 이동보다 2~3년 뒤 전문성을 키울 수 있는 자리로 이동할 때 만족도가 높습니다. ${guide.caution}을 실무에 적용하면 제안서, 계약서, 처우협의에서 불필요한 손실을 막을 수 있습니다. 승진운은 성과 자체보다 기록 방식이 성패를 가릅니다.

주간 보고, 성과 지표, 협업 피드백을 정리해 두면 평가 시즌에 강한 증거가 됩니다. ${guide.routine} 같은 자기관리 습관은 면접 컨디션과 업무 지속력을 동시에 끌어올립니다. 사람운도 놓치지 마세요. ${guide.peopleTip} 추천 한 줄, 레퍼런스 한 통이 예상보다 큰 문을 열어 줍니다. ${guide.timing} 올해 취업운의 결론은 명확합니다. 운은 준비한 사람에게 붙습니다. 작은 성과라도 문서화하고, 공부 시간을 고정하고, 네트워크를 성실히 관리하면 취업, 이직, 승진 중 적어도 한 축에서 확실한 상향을 체감할 수 있습니다.`
}

type CombinationData = {
  description: string
  fortuneText: string
}

function createCombinationData(animal: ZodiacAnimal, topic: FortuneTopic): CombinationData {
  const guide = ANIMAL_GUIDE[animal.slug]
  const fortuneText =
    topic.slug === 'jaemulun'
      ? buildJaemulunText(animal, guide)
      : topic.slug === 'yeonaewun'
        ? buildYeonaewunText(animal, guide)
        : buildChwieobunText(animal, guide)

  const description = `${animal.korean}띠 ${topic.korean} 2026 흐름을 상반기와 하반기로 나눠 정리했습니다. ${guide.timing} 포인트와 실전 조언으로 ${topic.korean} 타이밍을 구체적으로 확인해 보세요.`

  return { description, fortuneText }
}

export const ZODIAC_TOPIC_DATA = Object.fromEntries(
  ZODIAC_ANIMALS.flatMap((animal) =>
    FORTUNE_TOPICS.map((topic) => {
      const key = `${animal.slug}:${topic.slug}`
      return [key, createCombinationData(animal, topic)]
    }),
  ),
) as Record<`${ZodiacAnimalSlug}:${FortuneTopicSlug}`, CombinationData>

export const TOPIC_BREAKDOWN_LABELS = TOPIC_BREAKDOWN

export function findAnimalBySlug(slug: string) {
  return ZODIAC_ANIMALS.find((animal) => animal.slug === slug)
}

export function findTopicBySlug(slug: string) {
  return FORTUNE_TOPICS.find((topic) => topic.slug === slug)
}

export function getTopicData(animalSlug: ZodiacAnimalSlug, topicSlug: FortuneTopicSlug) {
  return ZODIAC_TOPIC_DATA[`${animalSlug}:${topicSlug}`]
}
