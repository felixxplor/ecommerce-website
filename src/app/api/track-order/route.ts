// app/api/track-order/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const email = url.searchParams.get('email')

    console.log('=== Track Order API Debug ===')
    console.log('Order ID:', id)
    console.log('Email:', email)

    if (!id || !email) {
      return NextResponse.json(
        { errors: { message: 'Order ID and email are required' } },
        { status: 400 }
      )
    }

    const possibleUrls = [
      process.env.WORDPRESS_URL,
      process.env.NEXT_PUBLIC_WORDPRESS_URL,
      'https://api.gizmooz.com',
      'https://gizmooz.com',
      'https://www.gizmooz.com',
    ].filter(Boolean)

    let lastError = null

    for (const wpApiUrl of possibleUrls) {
      try {
        const endpoint = `${wpApiUrl}/wp-json/wc/v3/track-order?order_id=${encodeURIComponent(
          id
        )}&email=${encodeURIComponent(email)}`

        console.log('Trying endpoint:', endpoint)

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Gizmooz-Frontend/1.0',
          },
          signal: AbortSignal.timeout(15000),
        })

        console.log('WordPress Response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        })

        const contentType = response.headers.get('content-type')
        const responseText = await response.text()

        // Check if response is HTML (error page)
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Non-JSON response from ${wpApiUrl}:`, responseText.substring(0, 500))
          continue
        }

        let data
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error(`JSON parse error from ${wpApiUrl}:`, parseError)
          continue
        }

        console.log('Parsed response data:', {
          hasData: !!data,
          dataKeys: data ? Object.keys(data) : [],
          isError: !!(data?.code || data?.errors),
          status: response.status,
        })

        // Handle WordPress error responses properly
        if (!response.ok) {
          // WordPress returns error in different formats, handle them all
          let errorMessage = 'Failed to track order'

          if (data?.message) {
            errorMessage = data.message
          } else if (data?.errors?.message) {
            errorMessage = data.errors.message
          } else if (data?.code === 'order_not_found') {
            errorMessage = 'Order not found'
          } else if (data?.code === 'unauthorized') {
            errorMessage = 'Email does not match order records'
          }

          console.log('WordPress error response:', {
            status: response.status,
            errorMessage,
            data,
          })

          // Forward the exact same status code from WordPress
          return NextResponse.json(
            { errors: { message: errorMessage } },
            { status: response.status }
          )
        }

        // Handle successful response but check if it's actually an error disguised as 200
        if (data?.code) {
          // WordPress sometimes returns 200 but with error codes
          console.log('WordPress returned 200 but with error code:', data.code)

          if (data.code === 'order_not_found') {
            return NextResponse.json(
              { errors: { message: data.message || 'Order not found' } },
              { status: 404 }
            )
          } else if (data.code === 'unauthorized') {
            return NextResponse.json(
              { errors: { message: data.message || 'Email does not match order records' } },
              { status: 401 }
            )
          }
        }

        // Check if we have actual order data
        if (!data || (typeof data === 'object' && !data.id && !data.order_number)) {
          console.log('No valid order data found')
          return NextResponse.json({ errors: { message: 'Order not found' } }, { status: 404 })
        }

        console.log('Success! Order found:', {
          orderId: data.id,
          orderNumber: data.order_number,
          hasTrackingItems: !!data.tracking_items,
        })

        return NextResponse.json({ order: data })
      } catch (error) {
        console.error(`Error with URL ${wpApiUrl}:`, error)
        lastError = error
        continue
      }
    }

    // If we get here, all URLs failed
    throw lastError || new Error('All WordPress URLs failed')
  } catch (err) {
    console.error('Final error in track-order:', err)

    return NextResponse.json(
      {
        errors: {
          message: err instanceof Error ? err.message : 'Failed to track order',
          details: 'Check server logs for more information',
        },
      },
      { status: 500 }
    )
  }
}
