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
import Link from 'next/link'

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z.string().min(1, {
    message: 'Please enter your password',
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
    // Filter out unwanted returnUrl values
    if (typeof window !== 'undefined') {
      const returnUrlParam = searchParams.get('returnUrl')

      if (
        returnUrlParam &&
        (returnUrlParam.includes('/login/reset-password') || returnUrlParam.includes('/register'))
      ) {
        // Instead of modifying the URL, just use a safe returnUrl
        const safeReturnUrl = '/'
        // Set the safe URL without triggering another navigation
        router.replace(`/login`, { scroll: false })
      }
    }
  }, []) // Empty dependency array to run only once

  useEffect(() => {
    // Only redirect if actually authenticated
    if (hasCredentials() && isAuthenticated) {
      // Don't redirect to reset-password or register
      const currentReturnUrl = searchParams.get('returnUrl') || '/'
      if (
        currentReturnUrl.includes('/login/reset-password') ||
        currentReturnUrl.includes('/register')
      ) {
        router.replace('/')
      } else {
        router.replace(currentReturnUrl)
      }
    } else {
      // Always make sure to set loading to false
      setIsLoading(false)
    }
  }, [isAuthenticated, searchParams, router])

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    setLoginError('')
    try {
      const success = await login(data.email, data.password)
      if (success) {
        router.replace(returnUrl)
      } else {
        setLoginError('Invalid email or password')
        form.reset({ email: data.email, password: '' })
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
      <h1 className="text-center text-4xl font-medium mb-3">Login</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-screen-lg mx-auto px-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email address"
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <div className="">
                  {loginError && loginError.toLowerCase().includes('email') && (
                    <p className="text-sm font-medium text-destructive">{loginError}</p>
                  )}
                </div>
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
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <div className="min-h-[24px]">
                  {loginError && !loginError.toLowerCase().includes('email') && (
                    <p className="text-sm font-medium text-destructive">{loginError}</p>
                  )}
                </div>
                <div className="mt-2">
                  <Link
                    href="/login/reset-password"
                    className="text-sm text-primary underline hover:text-primary/80"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </FormItem>
            )}
          />
          <div className="flex flex-col items-center mt-8">
            <Button
              type="submit"
              disabled={fetching}
              className="flex gap-x-2 items-center w-full md:w-1/5 py-6 text-lg"
            >
              Sign In
              {fetching && <LoadingSpinner noText />}
            </Button>

            <div className="mt-4">
              <Link
                href="/register"
                className="text-md text-primary underline hover:text-primary/80"
              >
                Create an account
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </MaxWidthWrapper>
  )
}
