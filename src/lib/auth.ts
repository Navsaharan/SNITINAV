import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import NextAuth from "next-auth/next"
import { User } from "@prisma/client"

// For more information on each option (and a full list of options) go to:
// https://next-auth.js.org/configuration/options
// https://next-auth.js.org/configuration/providers/credentials

export const authOptions = {
  // Use secure cookies in production
  useSecureCookies: process.env.NODE_ENV === 'production',
  // Trust the host header in production (behind Vercel proxy)
  trustHost: process.env.NODE_ENV === 'production',
  // Session configuration
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error", // Error code passed in query string as ?error=
  },
  // Authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Skip authentication during build time
        if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production' && !prisma) {
          console.log('Skipping auth during build')
          return null
        }

        if (!credentials?.email || !credentials?.password) {
          console.log('No credentials provided')
          throw new Error('Email and password are required')
        }

        try {
          console.log('Attempting to find user:', credentials.email)
          const user = await prisma.user.findUnique({
            where: {
              email: (credentials.email as string).toLowerCase()
            }
          })

          if (!user) {
            console.log('No user found with email:', credentials.email)
            throw new Error('Invalid email or password')
          }

          console.log('User found, checking password...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email)
            throw new Error('Invalid email or password')
          }

          console.log('Authentication successful for user:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            userType: 'ADMIN'
          }
        } catch (error) {
          console.error("Authentication error:", error)
          throw error // Re-throw to let NextAuth handle the error
        }
      }
    })
  ],

  // Callbacks
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.userType = user.userType
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id || token.sub!
        session.user.role = token.role as string
        session.user.userType = token.userType as string
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Handle role-based redirects
      if (url.includes('callbackUrl')) {
        const urlObj = new URL(url, baseUrl)
        const callbackUrl = urlObj.searchParams.get('callbackUrl')
        if (callbackUrl) {
          return callbackUrl
        }
      }

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },

  // Required environment variables
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  
  // Custom pages - using the one defined at the top
  // pages: {
  //   signIn: "/auth/signin",
  //   signOut: "/auth/signout",
  //   error: "/auth/error"
  // },

  // Experimental features
  experimental: {
    enableExperimentalWebSocket: true
  }
}

// Export the auth options for use in API routes
// authOptions is already exported above
