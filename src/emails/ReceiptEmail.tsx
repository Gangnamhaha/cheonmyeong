import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components'

interface ReceiptEmailProps {
  name: string
  planName: string
  amount: string
  date: string
  orderId: string
}

export function ReceiptEmail({ name, planName, amount, date, orderId }: ReceiptEmailProps) {
  return (
    <Html lang="ko">
      <Head />
      <Preview>사주해 AI 결제가 정상적으로 완료되었습니다</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-8 font-sans">
          <Container className="mx-auto max-w-xl rounded-lg bg-white p-8">
            <Text className="m-0 text-xl font-bold text-gray-900">사주해 AI</Text>
            <Text className="text-base text-gray-800">{name}님, 결제가 정상적으로 완료되었습니다.</Text>

            <Text className="mb-1 text-sm text-gray-600">플랜: {planName}</Text>
            <Text className="mb-1 text-sm text-gray-600">결제 금액: {amount}</Text>
            <Text className="mb-1 text-sm text-gray-600">결제 일시: {date}</Text>
            <Text className="mb-0 text-sm text-gray-600">주문번호: {orderId}</Text>

            <Hr className="my-6 border-gray-200" />
            <Text className="text-sm text-gray-600">
              환불 정책은 아래 링크에서 확인하실 수 있습니다.
            </Text>
            <Text className="text-sm text-gray-800">https://sajuhae.ai/refund-policy</Text>
            <Text className="m-0 text-xs text-gray-500">© 2026 사주해</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default ReceiptEmail
