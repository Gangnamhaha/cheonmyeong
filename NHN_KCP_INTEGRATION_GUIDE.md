# NHN KCP 결제 연동 가이드

## 현재 상태

✅ **코드 준비 완료** - KCP 채널 지원 로직 추가됨
✅ **Site Code 수령**: `IP6BM`
⏳ **전자계약 대기중** - KCP 가맹점관리자에서 완료 필요
⏳ **PG-API 인증서 미발급** - 전자계약 완료 후 발급 가능

---

## 통합 완료 절차

### 1단계: KCP 전자계약 완료 (사용자 작업)

**접속 정보:**
- URL: https://admin8.kginicis.com (또는 KCP 전용 URL)
- 사이트코드: `IP6BM`

**진행 순서:**
1. KCP 가맹점관리자 로그인
2. 메뉴: 상점정보관리 → 계약정보
3. "전자계약하기" 버튼 클릭
4. 전자서명 완료

**예상 소요시간:** 10-20분

---

### 2단계: PG-API 인증서 발급 (사용자 작업)

**접속 정보:**
- URL: https://partner.kcp.co.kr
- 사이트코드: `IP6BM`

**진행 순서:**
1. KCP Partner Admin 로그인
2. 메뉴: [기술관리센터] → [인증센터] → [KCP PG-API]
3. "인증서 발급" 버튼 클릭 (유효기간: 5년)
4. .zip 파일 다운로드 및 압축 해제

**다운로드 파일:**
```
KCP_AUTH_IP6BM_CERT.pem      (인증서)
KCP_AUTH_IP6BM_PRIKEY.pem    (개인키)
```

**예상 소요시간:** 5분

---

### 3단계: PortOne 채널 생성 (AI 작업)

**필요한 정보:**
- MID (Site Code): `IP6BM`
- PG-API Certificate: `.pem` 파일 내용
- PG-API Private Key: `.pem` 파일 내용
- Private Key Password: KCP에서 제공

**진행 순서:**
1. PortOne 관리자콘솔 접속
2. [결제 연동] → [채널 관리] → "채널 추가"
3. PG 선택: "NHN KCP"
4. 연동 모드: "실연동" (Live)
5. 채널 정보 입력:
   ```
   MID: IP6BM
   PG-API Certificate: [.pem 파일 내용 붙여넣기]
   PG-API Private Key: [.pem 파일 내용 붙여넣기]
   Private Key Password: [KCP 제공 비밀번호]
   ```
6. 저장 → `channelKey` 받기

**채널 2개 생성:**
- 일회성 결제용 (One-time): `PORTONE_CHANNEL_KEY_KCP_ONETIME`
- 정기결제용 (Billing): `PORTONE_CHANNEL_KEY_KCP_BILLING`

**예상 소요시간:** 10분

---

### 4단계: 환경변수 설정 (AI 작업)

**로컬 환경 (.env.local):**
```bash
# NHN KCP Channels
PORTONE_CHANNEL_KEY_KCP_ONETIME=channel-key-xxx
PORTONE_CHANNEL_KEY_KCP_BILLING=channel-key-xxx
```

**Vercel 환경변수 설정:**
```bash
vercel env add PORTONE_CHANNEL_KEY_KCP_ONETIME
vercel env add PORTONE_CHANNEL_KEY_KCP_BILLING
```

**환경:** Production, Preview, Development 모두 설정

---

### 5단계: 카드사 심사 요청 (사용자 작업)

**KCP Admin에서 심사 요청:**
1. KCP 가맹점관리자 로그인
2. 메뉴: 상점정보관리 → 서브몰 관리
3. "카드사 심사 요청" 버튼 클릭

**심사 기간:** 약 2주

**심사 완료 전:**
- 테스트 결제 가능 (KCP 테스트 사이트코드: `T0000`)
- 실 결제 불가

**심사 완료 후:**
- 실 결제 가능
- 정산 시작

---

### 6단계: 테스트 결제 (AI 작업)

**테스트 환경 설정:**
```bash
# KCP 테스트 채널 생성 (MID: T0000)
# 테스트 결제 진행
npm run test:payment
```

**테스트 항목:**
- [ ] 일회성 결제 (Card)
- [ ] 정기결제 (Billing Key)
- [ ] Webhook 수신 확인
- [ ] 크레딧 추가 확인

---

## 코드 변경사항

### 수정된 파일 (총 3개)

**1. `src/app/api/portone/route.ts`**
```typescript
// 변경 전
const PORTONE_CHANNEL_KEY_ONETIME =
  process.env.PORTONE_CHANNEL_KEY_ONETIME
  || process.env.PORTONE_CHANNEL_KEY_INICIS_ONETIME
  || process.env.PORTONE_CHANNEL_KEY_TOSS
  || ''

// 변경 후
const PORTONE_CHANNEL_KEY_ONETIME =
  process.env.PORTONE_CHANNEL_KEY_ONETIME
  || process.env.PORTONE_CHANNEL_KEY_KCP_ONETIME       // ← KCP 추가
  || process.env.PORTONE_CHANNEL_KEY_INICIS_ONETIME
  || process.env.PORTONE_CHANNEL_KEY_TOSS
  || ''
```

**2. `src/app/api/portone/billing/route.ts`**
```typescript
// 변경 전
const PORTONE_CHANNEL_KEY_BILLING =
  process.env.PORTONE_CHANNEL_KEY_BILLING
  || process.env.PORTONE_CHANNEL_KEY_INICIS_BILLING
  || process.env.PORTONE_CHANNEL_KEY_TOSS
  || ''

// 변경 후
const PORTONE_CHANNEL_KEY_BILLING =
  process.env.PORTONE_CHANNEL_KEY_BILLING
  || process.env.PORTONE_CHANNEL_KEY_KCP_BILLING       // ← KCP 추가
  || process.env.PORTONE_CHANNEL_KEY_INICIS_BILLING
  || process.env.PORTONE_CHANNEL_KEY_TOSS
  || ''
```

**3. `.env.local` 및 `.env.local.example`**
- KCP 채널 키 환경변수 추가
- 주석으로 설정 가이드 추가

### 변경되지 않은 부분

✅ **클라이언트 코드** - 변경 불필요
- `src/app/pricing/page.tsx`
- `src/app/HomeClient.tsx`
- `src/app/gunghap/page.tsx`

✅ **PortOne V2 API** - PG 무관하게 동일
- `src/lib/portone.ts`
- `src/app/api/portone/webhook/route.ts`

✅ **Webhook 처리** - 포맷 동일
- KCP와 이니시스 모두 동일한 webhook 구조

---

## Fallback 로직 우선순위

### 일회성 결제 채널
```
1. PORTONE_CHANNEL_KEY_ONETIME        (Primary - 현재 이니시스)
2. PORTONE_CHANNEL_KEY_KCP_ONETIME    (KCP 전용)
3. PORTONE_CHANNEL_KEY_INICIS_ONETIME (이니시스 전용)
4. PORTONE_CHANNEL_KEY_TOSS           (레거시 - Toss)
```

### 정기결제 채널
```
1. PORTONE_CHANNEL_KEY_BILLING        (Primary - 현재 이니시스)
2. PORTONE_CHANNEL_KEY_KCP_BILLING    (KCP 전용)
3. PORTONE_CHANNEL_KEY_INICIS_BILLING (이니시스 전용)
4. PORTONE_CHANNEL_KEY_TOSS           (레거시 - Toss)
```

### PG 전환 시나리오

**KCP를 Primary로 설정:**
```bash
# .env.local
PORTONE_CHANNEL_KEY_ONETIME=channel-key-xxx  # KCP 채널 키
PORTONE_CHANNEL_KEY_BILLING=channel-key-xxx  # KCP 채널 키
```

**이니시스와 KCP 동시 운영:**
```bash
# .env.local
PORTONE_CHANNEL_KEY_ONETIME=channel-key-inicis-onetime
PORTONE_CHANNEL_KEY_KCP_ONETIME=channel-key-kcp-onetime
```
→ 이니시스가 primary, KCP는 fallback

---

## 주의사항

### 바로오픈 서비스 제한사항

**지원 결제수단:**
- ✅ 카드 일시불
- ❌ 카드 할부 (불가)
- ❌ 간편결제 (별도 계약 필요)

**지원 결제 방식:**
- ✅ 일반결제 (One-time)
- ⚠️ 정기결제 (Billing Key) - 별도 계약 필요할 수 있음

**제한사항:**
- 바로오픈 서비스는 **카드 일시불만** 지원
- 할부, 간편결제 등은 카드사 심사 완료 후 별도 계약 필요

### 보안 주의사항

**노출된 비밀번호 변경 필수:**
- ⚠️ PortOne 비밀번호: `Aa5119446@` (변경 필요)
- ⚠️ Gmail 비밀번호: `chkim1004` (변경 필요)

**PG-API 인증서 관리:**
- 인증서 파일은 안전하게 보관
- 절대 Git에 커밋하지 말 것
- 유효기간 5년 - 만료 전 재발급 필요

---

## 문제 해결

### 전자계약이 보이지 않는 경우
- KCP 계약담당자에게 문의
- 사이트코드 `IP6BM` 활성화 확인 요청

### PG-API 인증서 발급 실패
- KCP Partner Admin 접속 권한 확인
- 전자계약 완료 여부 확인 (선행 조건)

### PortOne 채널 생성 실패
- MID 형식 확인 (`IP6BM` 정확히 입력)
- .pem 파일 전체 내용 복사 확인 (BEGIN ~ END 포함)
- Private Key Password 확인

### 결제 테스트 실패
- channelKey 환경변수 설정 확인
- Vercel 환경변수 배포 확인 (재배포 필요)
- Webhook URL 설정 확인 (PortOne 콘솔)

---

## 참고 자료

- [PortOne NHN KCP v2 통합 가이드](https://developers.portone.io/opi/ko/integration/pg/v2/kcp-v2)
- [PortOne 바로오픈 서비스 안내](https://help.portone.io/content/open-immediately)
- [NHN KCP Partner Admin](https://partner.kcp.co.kr)
- [NHN KCP 가맹점관리자](https://admin8.kginicis.com)

---

## 타임라인 예상

| 단계 | 작업 | 담당 | 예상 소요시간 |
|-----|------|-----|-------------|
| 1 | 전자계약 완료 | 사용자 | 10-20분 |
| 2 | PG-API 인증서 발급 | 사용자 | 5분 |
| 3 | PortOne 채널 생성 | AI | 10분 |
| 4 | 환경변수 설정 + 배포 | AI | 5분 |
| 5 | 카드사 심사 요청 | 사용자 | 5분 |
| 6 | 카드사 심사 대기 | - | **~2주** |
| 7 | 테스트 결제 | AI | 10분 |

**총 작업시간 (심사 제외):** 약 45-55분
**심사 포함 전체 기간:** 약 2-3주

---

**작성일:** 2026-03-28
**Site Code:** IP6BM
**Status:** 전자계약 대기중
