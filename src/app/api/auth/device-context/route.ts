import { NextRequest, NextResponse } from 'next/server'
import { getDeviceMetadata } from '@/lib/admin-audit'

export async function GET(request: NextRequest) {
  const metadata = getDeviceMetadata(request)
  return NextResponse.json({
    ipAddress: metadata.ipAddress,
    country: metadata.country,
    region: metadata.region,
    city: metadata.city,
    latitude: metadata.latitude,
    longitude: metadata.longitude,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
