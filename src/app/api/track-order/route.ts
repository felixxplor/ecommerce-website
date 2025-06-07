// app/api/track-order/route.ts
import { NextResponse } from 'next/server'

// app/api/track-order/route.ts
export async function GET(request: Request) {
  try {
    // Get parameters from URL
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const email = url.searchParams.get('email')

    // Log parameters for debugging
    console.log('Tracking order with ID:', id, 'and email:', email)

    // Validate inputs
    if (!id || !email) {
      return NextResponse.json(
        { errors: { message: 'Order ID and email are required' } },
        { status: 400 }
      )
    }

    // Call the WordPress REST API endpoint
    const wpApiUrl = process.env.WORDPRESS_URL || 'http://api.gizmooz.com'
    const endpoint = `${wpApiUrl}/wp-json/wc/v3/track-order?order_id=${encodeURIComponent(
      id
    )}&email=${encodeURIComponent(email)}`

    console.log('Making request to WordPress endpoint:', endpoint)

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]))

    // Get response content-type
    const contentType = response.headers.get('content-type')
    console.log('Content-Type:', contentType)

    // Always get text first for debugging
    const responseText = await response.text()

    // If it's not JSON, log the first 500 characters
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received. First 500 characters:')
      console.error(responseText.substring(0, 500))

      return NextResponse.json(
        { errors: { message: 'Received HTML instead of JSON. Check server configuration.' } },
        { status: 500 }
      )
    }

    // Parse the JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (error) {
      console.error('Error parsing JSON:', error)
      return NextResponse.json(
        { errors: { message: 'Failed to parse response as JSON' } },
        { status: 500 }
      )
    }

    // Return the order data
    return NextResponse.json({ order: data })
  } catch (err) {
    console.error('Error tracking order:', err)

    return NextResponse.json(
      { errors: { message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    )
  }
}
