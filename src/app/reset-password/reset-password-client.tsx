'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { resetPassword } from '@/lib/actions'

export default function ResetPasswordClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const key = searchParams.get('key')
  const login = searchParams.get('login')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword || password !== confirmPassword) {
      setError('Passwords must match and not be empty')
      return
    }

    const res = await resetPassword({ key, login, password })

    if (res.success) {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } else {
      setError(res.message || 'Something went wrong')
    }
  }

  if (!key || !login) return <p>Invalid reset link</p>

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded">
      <h2 className="text-2xl mb-4 font-bold">Reset Your Password</h2>
      {success ? (
        <p className="text-green-600">Password reset successful. Redirecting...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border p-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Reset Password
          </button>
        </form>
      )}
    </div>
  )
}
