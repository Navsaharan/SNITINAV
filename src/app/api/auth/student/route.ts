import NextAuth from 'next-auth/next'
import { studentAuthOptions } from '@/lib/student-auth'

const handler = NextAuth(studentAuthOptions) as any

export { handler as GET, handler as POST }
