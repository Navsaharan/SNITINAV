import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { createAdminSession, isAdminSessionActive, recordAdminAudit } from './admin-audit'

export const authOptions = {
  useSecureCookies: process.env.NODE_ENV === 'production',
  trustHost: process.env.NODE_ENV === 'production',
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        deviceId: { label: "Device ID", type: "text" },
        deviceName: { label: "Device name", type: "text" },
        platform: { label: "Platform", type: "text" },
        timezone: { label: "Timezone", type: "text" },
        language: { label: "Language", type: "text" },
        userAgent: { label: "User agent", type: "text" },
        ipAddress: { label: "IP address", type: "text" },
        country: { label: "Country", type: "text" },
        region: { label: "Region", type: "text" },
        city: { label: "City", type: "text" },
        latitude: { label: "Latitude", type: "text" },
        longitude: { label: "Longitude", type: "text" },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production' && !prisma) {
          console.log('Skipping auth during build')
          return null
        }
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const metadata = {
          deviceId: String(credentials.deviceId || 'unknown-device'),
          deviceName: String(credentials.deviceName || ''),
          platform: String(credentials.platform || ''),
          timezone: String(credentials.timezone || ''),
          language: String(credentials.language || ''),
          userAgent: String(credentials.userAgent || ''),
          ipAddress: String(credentials.ipAddress || ''),
          country: String(credentials.country || ''),
          region: String(credentials.region || ''),
          city: String(credentials.city || ''),
          latitude: Number.isFinite(Number(credentials.latitude)) ? Number(credentials.latitude) : null,
          longitude: Number.isFinite(Number(credentials.longitude)) ? Number(credentials.longitude) : null,
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: String(credentials.email).toLowerCase() },
          })
          if (!user) {
            await recordAdminAudit({ action: 'LOGIN_FAILED', method: 'POST', resource: 'authentication', details: { reason: 'invalid_credentials' }, success: false, errorMessage: 'Invalid email or password', ...metadata })
            throw new Error('Invalid email or password')
          }
          const isPasswordValid = await bcrypt.compare(String(credentials.password), user.password)
          if (!isPasswordValid) {
            await recordAdminAudit({ userId: user.id, action: 'LOGIN_FAILED', method: 'POST', resource: 'authentication', details: { reason: 'invalid_credentials' }, success: false, errorMessage: 'Invalid email or password', ...metadata })
            throw new Error('Invalid email or password')
          }
          const sessionId = await createAdminSession(user.id, metadata)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            userType: 'ADMIN',
            sessionId,
            deviceId: metadata.deviceId,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.userType = user.userType
        token.sessionId = user.sessionId
        token.deviceId = user.deviceId
      } else if (token.id && token.sessionId && !token.revoked) {
        try {
          if (!(await isAdminSessionActive(String(token.id), String(token.sessionId)))) {
            token.revoked = true
          }
        } catch (error) {
          console.error('Could not validate the active admin session:', error)
        }
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.revoked || !token?.id) return null as any
      session.user.id = token.id || token.sub!
      session.user.role = token.role as string
      session.user.userType = token.userType as string
      session.user.sessionId = token.sessionId as string
      session.user.deviceId = token.deviceId as string
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.includes('callbackUrl')) {
        const urlObj = new URL(url, baseUrl)
        const callbackUrl = urlObj.searchParams.get('callbackUrl')
        if (callbackUrl) return callbackUrl
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  experimental: {
    enableExperimentalWebSocket: true,
  },
}
