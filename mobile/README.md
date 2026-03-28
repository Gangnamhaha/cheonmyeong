# 사주해 모바일 앱 (App Store / Play Store)

이 폴더는 기존 웹 서비스(`https://sajuhae.vercel.app`)를 모바일 앱으로 배포하기 위한 Expo(WebView) 래퍼 프로젝트입니다.

## 1) 준비물

- Node.js 20+
- Expo 계정
- Apple Developer Program 계정
- Google Play Console 계정

## 2) 설치

```bash
cd mobile
npm install
```

## 3) 로컬 실행

```bash
npm run start
```

필요하면 웹앱 URL 교체:

```bash
set EXPO_PUBLIC_WEB_APP_URL=https://sajuhae.vercel.app
```

## 4) 빌드 (EAS)

```bash
npx eas login
npx eas init
npm run build:android
npm run build:ios
```

## 5) 제출

```bash
npm run submit:android
npm run submit:ios
```

## 6) 스토어 심사 체크리스트

- Privacy Policy URL: `https://sajuhae.vercel.app/privacy`
- Terms URL: `https://sajuhae.vercel.app/terms`
- Support Email: `any001004@gmail.com`
- Account deletion 안내(앱 설명/지원 페이지에 명시)
- 외부 결제 및 디지털 콘텐츠 정책 검토 (스토어 정책 준수)

## 7) 앱 정보 권장값

- 앱 이름: 사주해
- iOS Bundle ID: `com.sajuhae.mobile`
- Android Package: `com.sajuhae.mobile`
