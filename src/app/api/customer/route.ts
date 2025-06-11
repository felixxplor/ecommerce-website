// app/api/customer/route.ts
import { NextResponse } from 'next/server'
import {
  getClient,
  GetCustomerDetailsDocument,
  GetCustomerDetailsQuery,
  UpdateCustomerDocument,
  UpdateCustomerMutation,
} from '@/graphql'
import { print } from 'graphql'
import { GraphQLClient } from 'graphql-request'

interface CustomerResponse {
  customer: {
    firstName: string
    lastName: string
    email: string
    shipping: {
      firstName: string
      lastName: string
      address1: string
      address2: string
      city: string
      state: string
      postcode: string
      country: string
    }
  }
}

interface GraphQLError {
  response?: {
    errors?: Array<{
      message: string
    }>
  }
  message: string
}

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT as string

// Helper function to validate and extract token
function extractAndValidateToken(request: Request): {
  token: string | null
  error: NextResponse | null
} {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    console.log('No Authorization header found')
    return {
      token: null,
      error: NextResponse.json({ errors: { message: 'No authorization header' } }, { status: 401 }),
    }
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.log('Authorization header does not start with Bearer:', authHeader)
    return {
      token: null,
      error: NextResponse.json(
        { errors: { message: 'Invalid authorization format' } },
        { status: 401 }
      ),
    }
  }

  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    console.log('No token found after Bearer')
    return {
      token: null,
      error: NextResponse.json({ errors: { message: 'No token provided' } }, { status: 401 }),
    }
  }

  // Validate JWT format (should have 3 segments separated by dots)
  const segments = token.split('.')
  if (segments.length !== 3) {
    console.log(
      'Invalid token format - segments:',
      segments.length,
      'token:',
      token.substring(0, 50) + '...'
    )
    return {
      token: null,
      error: NextResponse.json({ errors: { message: 'Invalid token format' } }, { status: 401 }),
    }
  }

  console.log('Valid token extracted, length:', token.length)
  return { token, error: null }
}

export async function PUT(request: Request) {
  try {
    const { token, error } = extractAndValidateToken(request)
    if (error) return error

    const body = await request.json()
    const { firstName, lastName, email } = body

    // Validate input
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // First, get the current customer ID
    const customerData = await client.request<GetCustomerDetailsQuery>(GetCustomerDetailsDocument)

    if (!customerData.customer?.id) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Update customer with both main and billing info
    const response = await client.request<UpdateCustomerMutation>(UpdateCustomerDocument, {
      input: {
        id: customerData.customer.id,
        firstName,
        lastName,
        email,
        billing: {
          firstName,
          lastName,
          email,
          // Preserve existing billing fields
          address1: customerData.customer.billing?.address1,
          address2: customerData.customer.billing?.address2,
          city: customerData.customer.billing?.city,
          state: customerData.customer.billing?.state,
          postcode: customerData.customer.billing?.postcode,
          country: customerData.customer.billing?.country,
          phone: customerData.customer.billing?.phone,
        },
      },
    })

    if (!response.updateCustomer || !response.updateCustomer.customer) {
      return NextResponse.json({ error: 'Failed to update customer information' }, { status: 500 })
    }

    return NextResponse.json({
      customer: response.updateCustomer.customer,
    })
  } catch (error) {
    const graphqlError = error as GraphQLError
    console.error('Error updating customer:', {
      message: graphqlError.message,
      response: graphqlError.response,
    })

    // Handle specific GraphQL errors
    if (graphqlError.response?.errors?.[0]?.message) {
      const errorMessage = graphqlError.response.errors[0].message.toLowerCase()

      if (
        errorMessage.includes('invalid-secret-key') ||
        errorMessage.includes('wrong number of segments')
      ) {
        return NextResponse.json(
          { error: 'Authentication failed - invalid token' },
          { status: 401 }
        )
      }

      if (errorMessage.includes('email')) {
        return NextResponse.json(
          { error: 'Invalid email address or email already in use' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { token, error } = extractAndValidateToken(request)
    if (error) return error

    const client = getClient()
    client.setHeader('Authorization', `Bearer ${token}`)

    const wooSession = request.headers.get('woocommerce-session')
    if (wooSession) {
      client.setHeader('woocommerce-session', wooSession)
    }

    console.log('Making GraphQL request for customer details...')
    const data = await client.request<GetCustomerDetailsQuery>(print(GetCustomerDetailsDocument))

    if (!data.customer) {
      console.log('No customer data returned')
      return NextResponse.json(
        { errors: { message: 'Failed to retrieve customer details.' } },
        { status: 500 }
      )
    }

    console.log('Customer details retrieved successfully')
    return NextResponse.json({ customer: data.customer })
  } catch (err) {
    const error = err as GraphQLError
    console.error('Error fetching customer details:', {
      message: error.message,
      response: error.response,
    })

    // Handle specific authentication errors
    if (error.response?.errors?.[0]?.message) {
      const errorMessage = error.response.errors[0].message.toLowerCase()

      if (
        errorMessage.includes('invalid-secret-key') ||
        errorMessage.includes('wrong number of segments')
      ) {
        return NextResponse.json(
          { errors: { message: 'Authentication failed - invalid or malformed token' } },
          { status: 401 }
        )
      }

      if (errorMessage.includes('unauthorized') || errorMessage.includes('auth')) {
        return NextResponse.json({ errors: { message: 'Authentication failed' } }, { status: 401 })
      }
    }

    return NextResponse.json(
      { errors: { message: 'Failed to fetch customer details' } },
      { status: 500 }
    )
  }
}
