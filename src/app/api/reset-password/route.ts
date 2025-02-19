// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { SendPasswordResetEmailDocument, SendPasswordResetEmailMutation } from '@/graphql/generated'
import { print } from 'graphql'

interface SendPasswordResetEmailInput {
  username: string
}

export async function POST(request: Request) {
  try {
    // Check Content-Type
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { errors: { message: 'Content-Type must be application/json' } },
        { status: 400 }
      )
    }

    let body: SendPasswordResetEmailInput
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { errors: { message: 'Invalid JSON in request body' } },
        { status: 400 }
      )
    }

    if (!body.username) {
      return NextResponse.json({ errors: { message: 'Username is required' } }, { status: 400 })
    }

    const client = getClient()

    // Set default headers for WooCommerce session if present
    const wooSession = request.headers.get('woocommerce-session')
    if (wooSession) {
      client.setHeader('woocommerce-session', wooSession)
    }

    // Send password reset email using WooGraphQL mutation with proper typing
    const response = await client.request<SendPasswordResetEmailMutation>(
      print(SendPasswordResetEmailDocument),
      {
        input: {
          username: body.username,
          clientMutationId: 'reset-password-' + Date.now(),
        },
      }
    )

    if (!response?.sendPasswordResetEmail?.success) {
      return NextResponse.json(
        {
          errors: {
            message: 'Failed to send reset email',
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (err) {
    console.error('Error sending password reset email:', err)
    // Check if error is a GraphQL error
    if (err instanceof Error && err.message.includes('<!DOCTYPE')) {
      return NextResponse.json(
        { errors: { message: 'The server returned an invalid response. Please try again later.' } },
        { status: 502 }
      )
    }
    return NextResponse.json(
      { errors: { message: 'Failed to send password reset email' } },
      { status: 500 }
    )
  }
}
