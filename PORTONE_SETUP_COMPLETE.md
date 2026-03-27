# ✅ PortOne KG이니시스 설정 완료 가이드

## 📋 완료된 작업

### 1. KG이니시스 채널 생성 ✅
- **일반결제 채널**: `channel-key-dddefe27-45bb-4454-8c32-21f914b84a4a`
- **정기결제 채널**: `channel-key-48731faf-f841-489d-aaa1-8f9c55484fca`

### 2. 로컬 환경변수 설정 ✅
- `.env.local` 업데이트 완료
- `PORTONE_CHANNEL_KEY_ONETIME` 추가
- `PORTONE_CHANNEL_KEY_BILLING` 추가

### 3. 코드 수정 완료 ✅
- "크레딧 충전" → "요금제 구매" 문구 변경 (12개 파일)
- 빌드 성공 확인

---

## 🚀 다음 단계 (필수)

### STEP 1: Vercel 환경변수 설정

#### 방법 A: Vercel Dashboard (추천)

1. **https://vercel.com** 접속 후 로그인
2. **sajuhae** 프로젝트 선택
3. **Settings** 탭 클릭
4. 좌측 메뉴에서 **Environment Variables** 클릭
5. 다음 변수들을 **추가**:

**추가할 변수:**

| Name | Value | Environment |
|------|-------|-------------|
| `PORTONE_CHANNEL_KEY_ONETIME` | `channel-key-dddefe27-45bb-4454-8c32-21f914b84a4a` | Production, Preview, Development |
| `PORTONE_CHANNEL_KEY_BILLING` | `channel-key-48731faf-f841-489d-aaa1-8f9c55484fca` | Production, Preview, Development |

6. **Save** 클릭

#### 방법 B: Vercel CLI

터미널에서 실행:

```bash
# 일반결제 채널 키 추가
vercel env add PORTONE_CHANNEL_KEY_ONETIME
# 입력: channel-key-dddefe27-45bb-4454-8c32-21f914b84a4a
# Sensitive? y
# Environment: Production, Preview, Development 모두 선택

# 정기결제 채널 키 추가
vercel env add PORTONE_CHANNEL_KEY_BILLING
# 입력: channel-key-48731faf-f841-489d-aaa1-8f9c55484fca
# Sensitive? y
# Environment: Production, Preview, Development 모두 선택
```

---

### STEP 2: 웹훅(Webhook) 설정

#### 2.1 PortOne 콘솔에서 설정

1. **https://admin.portone.io** 접속
2. **[결제 연동]** → **[연동 정보]** → **[결제알림(Webhook) 관리]** 탭
3. **실연동** 모드 선택
4. **웹훅 URL 추가**:
   ```
   https://sajuhae.vercel.app/api/portone/webhook
   ```
5. **이벤트 선택** (모두 체크):
   - ✅ 결제 완료 (`Transaction.Paid`)
   - ✅ 결제 취소 (`Transaction.Cancelled`)
   - ✅ 빌링키 발급 (`BillingKey.Issued`)
   - ✅ 빌링키 삭제 (`BillingKey.Deleted`)
6. **저장** 클릭

#### 2.2 웹훅 엔드포인트 확인

웹훅을 받을 API는 이미 구현되어 있습니다:
- **파일**: `src/app/api/portone/webhook/route.ts`
- **엔드포인트**: `POST /api/portone/webhook`

---

### STEP 3: 배포 및 재시작

#### 3.1 Git 커밋 및 푸시

```bash
cd C:\saju\cheonmyeong

# 변경사항 커밋
git add .
git commit -m "feat: KG이니시스 결제 연동 및 문구 변경

- PortOne KG이니시스 채널 설정 (일반결제/정기결제)
- '크레딧 충전' → '요금제 구매' 문구 통일
- 환경변수에 PORTONE_CHANNEL_KEY_ONETIME/BILLING 추가"

# Vercel에 자동 배포
git push origin main
```

#### 3.2 Vercel 재배포 (환경변수 적용)

Vercel 환경변수를 추가한 후에는 **재배포**가 필요합니다:

**방법 A: Vercel Dashboard**
1. https://vercel.com → sajuhae 프로젝트
2. **Deployments** 탭
3. 최신 배포의 **...** 메뉴 → **Redeploy**
4. **Use existing Build Cache** 체크 해제
5. **Redeploy** 클릭

**방법 B: Vercel CLI**
```bash
vercel --prod
```

---

## 🧪 테스트

### 1. 일반결제 테스트

1. **https://sajuhae.vercel.app/pricing** 접속
2. **AI해석 이용권** 구매 클릭
3. 결제 진행 (KG이니시스)
4. 결제 완료 후 크레딧 증가 확인

### 2. 정기결제 테스트

1. **https://sajuhae.vercel.app/pricing** 접속
2. **월간 구독** 클릭
3. 빌링키 발급 및 첫 결제 진행
4. 구독 활성화 확인

### 3. 웹훅 동작 확인

배포 후 Vercel 로그 확인:
```bash
vercel logs --follow
```

결제 시 웹훅이 정상적으로 수신되는지 확인:
- `[Webhook] Transaction.Paid` 로그 확인
- 데이터베이스에 결제 정보 기록 확인

---

## 📌 중요 정보 요약

### PortOne 설정
- **Store ID**: `store-1daef225-2fe1-4684-8e25-41f01b49cc22`
- **일반결제 MID**: `MOI1061663`
- **정기결제 MID**: `MOIverce20`

### 채널 키
- **일반결제**: `channel-key-dddefe27-45bb-4454-8c32-21f914b84a4a`
- **정기결제**: `channel-key-48731faf-f841-489d-aaa1-8f9c55484fca`

### 웹훅 URL
- **Production**: `https://sajuhae.vercel.app/api/portone/webhook`

---

## 🔒 보안 권고사항

### 1. PortOne 비밀번호 즉시 변경 ⚠️
현재 비밀번호(`Aa5119446@`)가 채팅 기록에 노출되었습니다.

**즉시 변경하세요:**
1. https://admin.portone.io → 설정 → 비밀번호 변경
2. 강력한 비밀번호로 변경 (대소문자, 숫자, 특수문자 포함)

### 2. KG이니시스 SignKey 보안
- SignKey는 환경변수로만 관리
- Git에 커밋하지 않음 (`.env.local`은 `.gitignore`에 포함됨)
- 팀원과 공유 시 암호화된 채널 사용

### 3. API Secret 주기적 갱신
- PortOne API Secret 3개월마다 갱신 권장
- 갱신 시 Vercel 환경변수도 함께 업데이트

---

## ✅ 체크리스트

배포 전 확인:

- [ ] Vercel 환경변수 추가 (`PORTONE_CHANNEL_KEY_ONETIME`, `PORTONE_CHANNEL_KEY_BILLING`)
- [ ] PortOne 웹훅 URL 설정 (`https://sajuhae.vercel.app/api/portone/webhook`)
- [ ] Git 커밋 및 푸시
- [ ] Vercel 재배포 (환경변수 적용)
- [ ] 일반결제 테스트
- [ ] 정기결제 테스트
- [ ] 웹훅 동작 확인
- [ ] PortOne 비밀번호 변경 ⚠️

---

## 🆘 문제 해결

### 결제 실패 시
1. Vercel 로그 확인: `vercel logs`
2. PortOne 콘솔에서 채널 상태 확인
3. 환경변수가 올바르게 설정되었는지 확인

### 웹훅 미수신 시
1. PortOne 콘솔에서 웹훅 URL 확인
2. Vercel 로그에서 POST 요청 확인
3. 엔드포인트 응답 코드 확인 (200 OK 필수)

### 환경변수 미적용 시
1. Vercel Dashboard에서 변수 확인
2. 재배포 시 **Use existing Build Cache 체크 해제**
3. `vercel env pull .env.local` 실행 후 로컬 확인

---

## 📞 지원

문제 발생 시:
1. Vercel 로그 확인
2. PortOne 고객센터: https://portone.io/korea/ko/support
3. KG이니시스 기술지원: 1544-8661

---

**작성일**: 2026-03-27
**작성자**: AI Assistant (Claude)
