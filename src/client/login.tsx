'use client'

import { useEffect, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from './session-provider'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { hasCredentials } from '@/utils/session'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const LoginSchema = z.object({
  username: z.string().min(4, {
    message: 'Username must be at least 4 characters long',
  }),
  password: z.string().min(1, {
    message: 'Password must enter a password',
  }),
})

// Add this to your Login page component
export function Login() {
  const { login, isAuthenticated, fetching } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'
  const [isLoading, setIsLoading] = useState(true)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    // When the login page loads, store the previous page URL
    if (typeof window !== 'undefined') {
      const previousPage = sessionStorage.getItem('previousPage') || '/'
      if (!sessionStorage.getItem('previousPage') && document.referrer) {
        sessionStorage.setItem('previousPage', document.referrer)
      }
    }
  }, [])

  useEffect(() => {
    // Only redirect if actually authenticated
    if (hasCredentials() && isAuthenticated) {
      router.replace(returnUrl)
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, returnUrl, router])

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    setLoginError('')
    try {
      const success = await login(data.username, data.password)
      if (success) {
        router.replace(returnUrl)
      } else {
        setLoginError('Invalid username or password')
        form.reset({ username: data.username, password: '' })
      }
    } catch (error) {
      setLoginError('An error occurred during login. Please try again.')
      console.error('Login failed:', error)
    }
  }

  // Show loading state
  if (isLoading || (isAuthenticated && hasCredentials())) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <MaxWidthWrapper className="py-14">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-screen-lg mx-auto px-4"
        >
          {loginError && (
            <Alert variant="destructive">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your username or e-mail associate with your account."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={fetching} className="flex gap-x-2 items-center">
            Login
            {fetching && <LoadingSpinner noText />}
          </Button>
        </form>
      </Form>
    </MaxWidthWrapper>
  )
}
