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

interface PasswordResetEmailProps {
  resetUrl: string
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <Html lang="ko">
      <Head />
      <Preview>천명 AI 비밀번호 재설정 안내</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-8 font-sans">
          <Container className="mx-auto max-w-xl rounded-lg bg-white p-8">
            <Text className="m-0 text-xl font-bold text-gray-900">천명 AI</Text>
            <Text className="text-base text-gray-800">비밀번호 재설정을 요청하셨습니다.</Text>
            <Text className="text-base text-gray-700">
              아래 버튼을 눌러 1시간 이내에 비밀번호를 변경해주세요.
            </Text>
            <Button
              href={resetUrl}
              className="rounded-md bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
            >
              비밀번호 재설정
            </Button>
            <Text className="text-sm text-gray-600">
              본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.
            </Text>
            <Hr className="my-6 border-gray-200" />
            <Text className="m-0 text-xs text-gray-500">© 2026 천명(天命)</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default PasswordResetEmail
