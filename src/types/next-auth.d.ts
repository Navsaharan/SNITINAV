import "next-auth"
import "next-auth/jwt"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      type?: string
      studentId?: string | null
      department?: string | null
      firstName?: string | null
      lastName?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    type?: string
    studentId?: string | null
    department?: string | null
    firstName?: string | null
    lastName?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    userType?: string
    type?: string
    studentId?: string | null
    department?: string | null
    firstName?: string | null
    lastName?: string | null
  }
}
