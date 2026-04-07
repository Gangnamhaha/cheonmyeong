import { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import KakaoProvider from 'next-auth/providers/kakao'
import CredentialsProvider from 'next-auth/providers/credentials'
import { registerUser } from '@/lib/admin'
import { verifyUserPassword } from '@/lib/user'
import { getUserCredits, addCredits } from '@/lib/credits'
import { Redis } from '@upstash/redis'

const AUTH_ORIGIN = process.env.NEXTAUTH_URL || 'https://cheonmyeong.vercel.app'

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const authRedis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                redirect_uri: `${AUTH_ORIGIN}/api/auth/callback/google`,
              },
            },
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
                redirect_uri: `${AUTH_ORIGIN}/api/auth/callback/kakao`,
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
          } catch (err) {
            console.error('Failed to register user in admin store:', err)
          }

          // Guest-to-member credit merge
          try {
            const guestUserId = `email_${user.email.toLowerCase().trim()}`
            if (authRedis && user.id !== guestUserId) {
              const guestCredits = await authRedis.get(`credits:user:${guestUserId}`)
              if (guestCredits && typeof guestCredits === 'object' && 'total' in guestCredits) {
                const gc = guestCredits as { total: number; used: number }
                const remaining = gc.total - gc.used
                if (remaining > 0) {
                  // Merge guest credits to member account
                  const memberCredits = await getUserCredits(user.id)
                  const mergedTotal = memberCredits.total - memberCredits.used + remaining
                  await authRedis.set(`credits:user:${user.id}`, {
                    total: mergedTotal, used: 0,
                    plan: memberCredits.plan === 'free' ? (gc as { plan?: string }).plan || 'free' : memberCredits.plan,
                    lastRefill: new Date().toISOString().slice(0, 10),
                  })
                  // Clear guest credits to prevent double merge
                  await authRedis.del(`credits:user:${guestUserId}`)
                  await authRedis.del(`credits:used:${guestUserId}`)
                  console.log(`Merged ${remaining} guest credits for ${user.email}`)
                }
              }
            }
          } catch (err) {
            console.error('Failed to merge guest credits:', err)
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

  secret: process.env.NEXTAUTH_SECRET,
}
