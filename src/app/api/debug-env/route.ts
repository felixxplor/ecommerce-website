// Create this file: app/api/debug-env/route.ts
// This will show you what environment variables are actually available

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    SESSION_TOKEN_LS_KEY: 'woo-session-token',
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? 'SET'
      : 'NOT_SET',
    // List all environment variables that start with NEXT_PUBLIC or SESSION
    envKeys: Object.keys(process.env).filter(
      (key) => key.startsWith('NEXT_PUBLIC_') || key.includes('SESSION') || key.includes('TOKEN')
    ),
  })
}
