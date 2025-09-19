import { NextRequest, NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { studentAuthOptions } from '@/lib/student-auth'

const handler = NextAuth(studentAuthOptions)

export { handler as GET, handler as POST }
