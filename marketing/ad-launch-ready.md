# 광고 즉시 집행 가이드

> 2026-04-12 작성. 이 문서의 소재를 바로 Meta/네이버에 등록하세요.

## 1. Meta (Instagram/Facebook) 광고

### 캠페인 구조

```
캠페인: 사주해_런칭_2026Q2
├── 광고세트 A: 무료유입 (TOFU)
│   ├── 타겟: 18~45세, 한국, 관심사(운세/사주/타로/심리테스트)
│   ├── 일 예산: ₩20,000
│   └── 광고 A-1, A-2
├── 광고세트 B: 차별점 (MOFU)
│   ├── 타겟: 앱 방문자 유사타겟
│   ├── 일 예산: ₩15,000
│   └── 광고 B-1, B-2
└── 광고세트 D: 리타게팅 (BOFU)
    ├── 타겟: 웹사이트 방문 7일 이내
    ├── 일 예산: ₩15,000
    └── 광고 D-1, D-2
```

### 광고 소재 (복붙용)

**A-1 (무료유입 — 짧은)**
- 헤드라인: 30초 사주 분석, 무료로 시작
- 본문: 생년월일만 입력하면 AI 사주해석 완료. 특허 출원 멀티모달 AI가 당신의 사주를 분석합니다.
- CTA: 무료로 시작하기
- 랜딩: https://sajuhae.vercel.app?utm_source=meta&utm_medium=cpc&utm_campaign=launch&utm_content=A1

**A-2 (무료유입 — 긴)**
- 헤드라인: 특허 출원 AI가 분석하는 사주, 30초면 충분합니다
- 본문: 사주 달력, AI 해석, 궁합, 사주 음악까지 한 번에 체험. 매일 무료 1회 AI 해석. 월 3,900원부터 구독.
- CTA: 지금 분석하기
- 랜딩: https://sajuhae.vercel.app?utm_source=meta&utm_medium=cpc&utm_campaign=launch&utm_content=A2

**B-1 (차별점)**
- 헤드라인: 당신의 사주가 음악이 되고, 영상이 됩니다
- 본문: 특허 출원 멀티모달 AI 기술. 오행 기반 사주 음악과 시네마틱 애니메이션을 무료로 체험해보세요.
- CTA: 내 사주 체험하기
- 랜딩: https://sajuhae.vercel.app?utm_source=meta&utm_medium=cpc&utm_campaign=launch&utm_content=B1

**B-2 (특허)**
- 헤드라인: "사주를 듣는다" — 특허 출원 AI 사주 음악
- 본문: 오행(목화토금수)을 음계로 변환하는 특허 기술. 나만의 사주 음악을 듣고 친구에게 공유해보세요.
- CTA: 내 사주 음악 듣기
- 랜딩: https://sajuhae.vercel.app?utm_source=meta&utm_medium=cpc&utm_campaign=patent&utm_content=B2

**D-1 (리타게팅)**
- 헤드라인: 무료 체험이 마음에 드셨나요?
- 본문: 매일 1회 무료 AI 해석은 맛보기입니다. 라이트 구독(월 3,900원)으로 매달 5회 심층 해석을 받아보세요.
- CTA: 구독 시작하기
- 랜딩: https://sajuhae.vercel.app/pricing?utm_source=meta&utm_medium=cpc&utm_campaign=retarget&utm_content=D1

**D-2 (리타게팅)**
- 헤드라인: 오늘의 운세부터 다시 확인해보세요
- 본문: 사주 달력으로 오행 흐름을 보고 중요한 일정을 조정하세요. 구독하면 매일 운세 푸시 + 월간 리포트.
- CTA: 오늘 일진 확인
- 랜딩: https://sajuhae.vercel.app/saju/calendar?utm_source=meta&utm_medium=cpc&utm_campaign=retarget&utm_content=D2

### Meta 픽셀 설정
```
Pixel ID: (Meta Business Suite에서 생성)
이벤트:
- PageView: 모든 페이지
- Lead: 사주 분석 완료
- Subscribe: 구독 시작
- Purchase: 리포트 구매
```

---

## 2. 네이버 검색광고

### 키워드 그룹

**그룹 A: 브랜드 (CPC ₩100~200)**
- 사주해, sajuhae, AI 사주해

**그룹 B: 핵심 (CPC ₩300~800)**
- 무료 사주, 사주 풀이, 사주팔자, AI 사주
- 무료 운세, 오늘의 운세, 사주 보기

**그룹 C: 궁합 (CPC ₩200~500)**
- 궁합, 사주 궁합, 무료 궁합, 궁합 보기

**그룹 D: 롱테일 (CPC ₩100~300)**
- 2026 운세, 신년운세, 토정비결
- 사주 음악, 사주 앱 추천
- 대운 보기, 만세력

### 광고 문구 (네이버)

**문구 1**
- 제목: 사주해 - 특허 AI 사주 풀이
- 설명: 매일 1회 무료 AI 해석. 사주를 음악과 영상으로 체험. 월 3,900원부터 구독.

**문구 2**
- 제목: 무료 사주 - 30초 AI 분석
- 설명: 생년월일만 입력하면 사주·오행·궁합 분석 완료. 특허 출원 멀티모달 AI 기술.

**문구 3**
- 제목: AI 궁합 분석 - 사주해
- 설명: 관계 강점, 갈등 포인트, 장기 전망까지. 무료 기본 궁합 + 프리미엄 AI 궁합.

---

## 3. UTM 규칙

```
utm_source: meta / naver / google / cafe / blog / youtube
utm_medium: cpc / organic / social / referral
utm_campaign: launch / patent / retarget / seo
utm_content: A1 / A2 / B1 / B2 / D1 / D2
```

---

## 4. 일 예산 ₩50,000 (월 ₩150만) 배분

| 채널 | 일 예산 | 월 예산 | 목적 |
|------|---------|---------|------|
| Meta (무료유입) | ₩20,000 | ₩600,000 | 신규 유입 |
| Meta (리타게팅) | ₩15,000 | ₩450,000 | 구독 전환 |
| 네이버 검색광고 | ₩15,000 | ₩450,000 | 검색 유입 |
| **합계** | **₩50,000** | **₩1,500,000** | |

## 5. 1주차 성과 기준

| 지표 | 최소 목표 |
|------|----------|
| 클릭 | 일 200+ |
| CPC | ₩250 이하 |
| 랜딩 진입 | 일 180+ |
| 사주 분석 완료 | 일 50+ |
| 구독 전환 | 주 20+ |
