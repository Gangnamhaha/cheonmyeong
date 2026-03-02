# 커스텀 도메인 설정 가이드

## Vercel에서 커스텀 도메인 연결하기

### 1. 도메인 구매
- [Namecheap](https://namecheap.com), [GoDaddy](https://godaddy.com), [가비아](https://gabia.com) 등에서 도메인 구매

### 2. Vercel 프로젝트에 도메인 추가
```bash
# CLI로 추가
npx vercel domains add 도메인.com

# 또는 Vercel 대시보드에서:
# 1. https://vercel.com/dashboard 접속
# 2. cheonmyeong 프로젝트 클릭
# 3. Settings > Domains
# 4. 도메인 입력 후 Add
```

### 3. DNS 설정
Vercel이 안내하는 DNS 레코드를 도메인 관리 페이지에서 설정:

**A 레코드 (루트 도메인):**
| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |

**CNAME 레코드 (www 서브도메인):**
| Type | Name | Value |
|------|------|-------|
| CNAME | www | cname.vercel-dns.com |

### 4. SSL 인증서
Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급합니다.
DNS 전파 후 10~30분 내에 HTTPS가 활성화됩니다.

### 5. 확인
```bash
# DNS 전파 확인
nslookup 도메인.com

# 또는 브라우저에서 https://도메인.com 접속
```

## 추천 도메인 예시
- `cheonmyeong.kr`
- `saju.app`
- `my-saju.com`
- `천명.kr` (한글 도메인)

## 참고
- DNS 전파에 최대 48시간 소요될 수 있음 (보통 30분 이내)
- Vercel 무료 플랜에서도 커스텀 도메인 사용 가능
- 도메인당 SSL 인증서 자동 갱신
