import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html lang="ko">
      <Head />
      <Preview>천명 AI 가입을 환영합니다</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-8 font-sans">
          <Container className="mx-auto max-w-xl rounded-lg bg-white p-8">
            <Text className="m-0 text-xl font-bold text-gray-900">천명 AI</Text>
            <Text className="text-base text-gray-800">안녕하세요 {name}님, 천명 AI 가입을 환영합니다.</Text>
            <Text className="text-base text-gray-700">
              지금 바로 무료 크레딧 3회로 오늘의 사주 해석을 시작해보세요.
            </Text>
            <Button
              href="/"
              className="rounded-md bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
            >
              사주 분석 시작하기
            </Button>
            <Hr className="my-6 border-gray-200" />
            <Text className="m-0 text-xs text-gray-500">© 2026 천명(天命)</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default WelcomeEmail
