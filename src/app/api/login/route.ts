import { NextResponse } from 'next/server'
import { print } from 'graphql'

import {
  GetSessionDocument,
  GetSessionQuery,
  LoginDocument,
  LoginMutation,
  getClient,
} from '@/graphql'
import { deleteCredentials } from '@/utils/session'

type RequestBody =
  | {
      auth: string
      username: undefined
      password: undefined
    }
  | {
      auth: undefined
      username: string
      password: string
    }

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as RequestBody
    const graphQLClient = getClient()

    if (!username || !password) {
      return NextResponse.json(
        {
          errors: {
            message: 'Proper credential must be provided for authentication',
          },
        },
        { status: 500 }
      )
    }

    // First login to get auth tokens
    const loginData = await graphQLClient.request<LoginMutation>(LoginDocument, {
      username,
      password,
    })

    if (!loginData?.login) {
      return NextResponse.json({ errors: { message: 'Login failed.' } }, { status: 500 })
    }

    const { authToken, refreshToken } = loginData.login
    if (!authToken || !refreshToken) {
      return NextResponse.json(
        { errors: { message: 'Failed to retrieve credentials.' } },
        { status: 500 }
      )
    }

    // Set auth token and try to get session
    graphQLClient.setHeader('Authorization', `Bearer ${authToken}`)

    // Get customer data which should generate a new session
    const sessionData = await graphQLClient.request<GetSessionQuery>(GetSessionDocument)

    // Check if we got customer data which means auth is working
    if (!sessionData?.customer) {
      return NextResponse.json(
        { errors: { message: 'Failed to authenticate with new token.' } },
        { status: 500 }
      )
    }

    // Make one more request to ensure we get the session header
    const { headers } = await graphQLClient.rawRequest<GetSessionQuery>(print(GetSessionDocument))

    const sessionToken = headers.get('woocommerce-session')

    return NextResponse.json({
      authToken,
      refreshToken,
      sessionToken: sessionToken || loginData.login.authToken,
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ errors: { message: 'Login credentials invalid.' } }, { status: 500 })
  }
}
