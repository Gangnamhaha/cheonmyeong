import { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import KakaoProvider from 'next-auth/providers/kakao'
import CredentialsProvider from 'next-auth/providers/credentials'
import { registerUser } from '@/lib/admin'
import { verifyUserPassword } from '@/lib/user'

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
          KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
            authorization: {
              params: {
                scope: 'profile_nickname profile_image account_email',
              },
            },
          }),
        ]
      : []),

    // Email/password login
    CredentialsProvider({
      name: '이메일 로그인',
      credentials: {
        email: { label: '이메일', type: 'email', placeholder: 'email@example.com' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await verifyUserPassword(credentials.email, credentials.password)
        if (!user) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
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
