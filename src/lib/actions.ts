import { getClient } from '@/graphql'
import { ResetUserPasswordDocument, ResetUserPasswordMutation } from '@/graphql/generated'
import { print } from 'graphql'

export async function resetPassword({
  key,
  login,
  password,
}: {
  key: string | null
  login: string | null
  password: string
}) {
  if (!key || !login) {
    return { success: false, message: 'Missing reset key or login' }
  }

  try {
    const client = getClient()

    const res = await client.request<ResetUserPasswordMutation>(print(ResetUserPasswordDocument), {
      input: {
        key,
        login,
        password,
      },
    })

    if (res.resetUserPassword?.user) {
      return { success: true }
    } else {
      return { success: false, message: 'Failed to reset password' }
    }
  } catch (err) {
    console.error('Reset password error:', err)
    return { success: false, message: 'Something went wrong' }
  }
}
