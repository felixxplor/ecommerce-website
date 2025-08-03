// app/api/register/route.ts

import { NextResponse } from 'next/server'
import { print } from 'graphql'

import {
  GetSessionDocument,
  GetSessionQuery,
  RegisterDocument,
  RegisterMutation,
  getClient,
} from '@/graphql'

type RequestBody = {
  username: string
  email: string
  password: string
}

export async function POST(request: Request) {
  try {
    const { username, email, password } = (await request.json()) as RequestBody
    const graphQLClient = getClient()

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          errors: {
            message: 'Username, email and password are required for registration',
          },
        },
        { status: 400 }
      )
    }

    const data = await graphQLClient.request<RegisterMutation>(RegisterDocument, {
      username,
      email,
      password,
    })

    if (!data?.registerCustomer) {
      return NextResponse.json({ errors: { message: 'Registration failed.' } }, { status: 500 })
    }

    const { authToken, refreshToken } = data.registerCustomer
    if (!authToken || !refreshToken) {
      return NextResponse.json(
        { errors: { message: 'Failed to retrieve credentials.' } },
        { status: 500 }
      )
    }

    graphQLClient.setHeader('Authorization', `Bearer ${authToken}`)
    const { data: _, headers } = await graphQLClient.rawRequest<GetSessionQuery>(
      print(GetSessionDocument)
    )

    const sessionToken = headers.get('woocommerce-session')
    if (!sessionToken) {
      return NextResponse.json(
        { errors: { message: 'Failed to retrieve session token.' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ authToken, refreshToken, sessionToken })
  } catch (err) {
    // console.error(err)
    return NextResponse.json(
      { errors: { message: 'Registration failed. Please try again.' } },
      { status: 500 }
    )
  }
}
