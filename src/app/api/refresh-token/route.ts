// app/api/refresh-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { print } from 'graphql'

// Import your WordPress GraphQL documents or create them inline
// We'll create an inline document since we don't know your project structure
import { gql } from 'graphql-request'

interface RefreshTokenResponse {
  refreshJwtAuthToken?: {
    authToken: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 })
    }

    // Initialize GraphQL client
    const client = getClient()

    // Create a raw GraphQL query that should work with any WordPress JWT plugin
    const query = `
      mutation RefreshToken($input: RefreshJwtAuthTokenInput!) {
        refreshJwtAuthToken(input: $input) {
          authToken
        }
      }
    `

    // If the above doesn't work, try this alternative format depending on your JWT plugin
    const alternativeQuery = `
      mutation RefreshToken {
        refreshToken(jwtRefreshToken: "${refreshToken}") {
          authToken
        }
      }
    `

    // Try the first mutation format
    try {
      const result = await client.request<RefreshTokenResponse>(query, {
        input: {
          clientMutationId: `refresh-${Date.now()}`,
          jwtRefreshToken: refreshToken,
        },
      })

      if (result?.refreshJwtAuthToken?.authToken) {
        return NextResponse.json({
          authToken: result.refreshJwtAuthToken.authToken,
          timestamp: Date.now(),
        })
      }
    } catch (primaryError) {
      console.log('Primary refresh token format failed, trying alternative', primaryError)

      // If first approach fails, try alternative approach
      try {
        const result = await client.request<any>(alternativeQuery)

        if (result?.refreshToken?.authToken) {
          return NextResponse.json({
            authToken: result.refreshToken.authToken,
            timestamp: Date.now(),
          })
        }
      } catch (alternativeError) {
        console.error('Alternative refresh token format also failed', alternativeError)
        throw alternativeError
      }
    }

    // If we get here, neither approach worked but didn't throw errors
    throw new Error('Could not refresh token - unknown response format')
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      {
        error: 'Failed to refresh token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
