// app/api/store-checkout-data/route.ts
import { NextRequest, NextResponse } from 'next/server'

// In a real implementation, you would use a database or Redis for storage
// For this example, we'll use a simple in-memory store
// NOTE: This will be reset when the server restarts
const checkoutDataStore: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const { transactionId, uniqueId, customerInfo, timestamp } = await request.json()

    if (!transactionId && !uniqueId) {
      return NextResponse.json(
        { error: 'Transaction ID or unique ID is required' },
        { status: 400 }
      )
    }

    if (!customerInfo) {
      return NextResponse.json({ error: 'Customer information is required' }, { status: 400 })
    }

    // Use transaction ID as the key, or fall back to unique ID
    const key = transactionId || uniqueId

    // Store the checkout data
    checkoutDataStore[key] = {
      customerInfo,
      timestamp: timestamp || Date.now(),
      stored_at: new Date().toISOString(),
    }

    console.log(`Stored checkout data for ${key}:`, checkoutDataStore[key])

    // Set up a cleanup timer (5 minutes)
    setTimeout(() => {
      if (checkoutDataStore[key]) {
        console.log(`Cleaning up checkout data for ${key}`)
        delete checkoutDataStore[key]
      }
    }, 5 * 60 * 1000)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error storing checkout data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to store checkout data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')
    const uniqueId = searchParams.get('uniqueId')

    if (!transactionId && !uniqueId) {
      return NextResponse.json(
        { error: 'Transaction ID or unique ID is required' },
        { status: 400 }
      )
    }

    // Try to get the data using transaction ID first, then unique ID
    const key = transactionId || uniqueId
    const data = checkoutDataStore[key as string]

    if (!data) {
      return NextResponse.json(
        { error: 'Checkout data not found for the given ID' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error retrieving checkout data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve checkout data' },
      { status: 500 }
    )
  }
}
