import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const studentAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "student-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Skip authentication during build time
        if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production' && !prisma) {
          return null
        }

        try {
          const emailAccount = await prisma.emailAccount.findUnique({
            where: {
              email: credentials.email,
              isActive: true
            }
          })

          if (!emailAccount) {
            return null
          }

          // Check if account is locked
          if (emailAccount.lockedUntil && emailAccount.lockedUntil > new Date()) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            emailAccount.password
          )

          if (!isPasswordValid) {
            // Increment login attempts
            await prisma.emailAccount.update({
              where: { id: emailAccount.id },
              data: { 
                loginAttempts: emailAccount.loginAttempts + 1,
                // Lock account after 5 failed attempts for 30 minutes
                ...(emailAccount.loginAttempts >= 4 && {
                  lockedUntil: new Date(Date.now() + 30 * 60 * 1000)
                })
              }
            })
            return null
          }

          // Update last login and reset attempts
          await prisma.emailAccount.update({
            where: { id: emailAccount.id },
            data: { 
              lastLogin: new Date(),
              loginAttempts: 0,
              lockedUntil: null
            }
          })

          return {
            id: emailAccount.id,
            email: emailAccount.email,
            name: emailAccount.displayName || `${emailAccount.firstName} ${emailAccount.lastName}`,
            type: emailAccount.type,
            studentId: emailAccount.studentId,
            department: emailAccount.department,
            firstName: emailAccount.firstName,
            lastName: emailAccount.lastName
          }
        } catch (error) {
          console.error("Student authentication error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours for students
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.type = user.type
        token.studentId = user.studentId
        token.department = user.department
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id || token.sub!
        session.user.type = token.type as string
        session.user.studentId = token.studentId as string
        session.user.department = token.department as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to student dashboard after login
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/student/dashboard`
    }
  },
  pages: {
    signIn: "/student/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
}

// Helper functions for student authentication
export const createEmailAccount = async (data: {
  email: string
  password: string
  type: 'STUDENT' | 'INSTITUTE' | 'ADMIN'
  firstName?: string
  lastName?: string
  displayName?: string
  department?: string
  studentId?: string
  createdById: string
}) => {
  const hashedPassword = await bcrypt.hash(data.password, 12)
  
  return await prisma.emailAccount.create({
    data: {
      ...data,
      password: hashedPassword,
    }
  })
}

export const updateEmailAccountPassword = async (accountId: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  
  return await prisma.emailAccount.update({
    where: { id: accountId },
    data: { 
      password: hashedPassword,
      loginAttempts: 0,
      lockedUntil: null
    }
  })
}

export const validateEmailFormat = (email: string, type: 'STUDENT' | 'INSTITUTE' | 'ADMIN') => {
  const domain = process.env.EMAIL_DOMAIN || 'institute.edu'
  
  if (!email.endsWith(`@${domain}`)) {
    return false
  }
  
  const localPart = email.split('@')[0]
  
  switch (type) {
    case 'STUDENT':
      // Student emails should be numeric (student ID)
      return /^\d+$/.test(localPart)
    case 'INSTITUTE':
      // Institute emails should be department names
      return /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(localPart)
    case 'ADMIN':
      // Admin emails can be any valid format
      return /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(localPart)
    default:
      return false
  }
}

export const generateEmailAddress = (identifier: string, type: 'STUDENT' | 'INSTITUTE' | 'ADMIN') => {
  const domain = process.env.EMAIL_DOMAIN || 'institute.edu'
  
  switch (type) {
    case 'STUDENT':
      return `${identifier}@${domain}`
    case 'INSTITUTE':
      return `${identifier.toLowerCase()}@${domain}`
    case 'ADMIN':
      return `${identifier.toLowerCase()}@${domain}`
    default:
      throw new Error('Invalid account type')
  }
}

// Account management helpers
export const getAccountQuotaUsage = async (accountId: string) => {
  const account = await prisma.emailAccount.findUnique({
    where: { id: accountId },
    select: { quota: true, usedQuota: true }
  })
  
  if (!account) return null
  
  return {
    quota: Number(account.quota),
    used: Number(account.usedQuota),
    available: Number(account.quota) - Number(account.usedQuota),
    percentage: (Number(account.usedQuota) / Number(account.quota)) * 100
  }
}

export const updateAccountQuota = async (accountId: string, sizeChange: number) => {
  return await prisma.emailAccount.update({
    where: { id: accountId },
    data: {
      usedQuota: {
        increment: sizeChange
      }
    }
  })
}
