import { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { registerUser } from '@/lib/admin'

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Kakao OAuth
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET
      ? [
          {
            id: 'kakao',
            name: 'Kakao',
            type: 'oauth' as const,
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
            authorization: {
              url: 'https://kauth.kakao.com/oauth/authorize',
              params: { scope: 'profile_nickname profile_image' },
            },
            token: 'https://kauth.kakao.com/oauth/token',
            userinfo: 'https://kapi.kakao.com/v2/user/me',
            profile(profile: Record<string, unknown>) {
              const kakaoAccount = profile.kakao_account as Record<string, unknown> | undefined
              const kakaoProfile = kakaoAccount?.profile as Record<string, unknown> | undefined
              return {
                id: String(profile.id),
                name: (kakaoProfile?.nickname as string) ?? '카카오 사용자',
                email: (kakaoAccount?.email as string) ?? undefined,
                image: (kakaoProfile?.profile_image_url as string) ?? undefined,
              }
            },
          },
        ]
      : []),

    // Demo credentials (for testing without OAuth setup)
    CredentialsProvider({
      name: '테스트 로그인',
      credentials: {
        email: { label: '이메일', type: 'email', placeholder: 'test@example.com' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        return {
          id: credentials.email,
          name: credentials.email.split('@')[0],
          email: credentials.email,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id

        if (user.email) {
          try {
            await registerUser(user.id, user.email, user.name ?? undefined)
          } catch {
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as Record<string, unknown>).id = token.id as string
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET || 'cheonmyeong-dev-secret-change-in-production',
}
