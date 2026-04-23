import { NextResponse } from 'next/server'

// This endpoint is deprecated. Admin login is now handled via Server Action.
export function POST() {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 })
}
