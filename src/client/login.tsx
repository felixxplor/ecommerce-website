'use client'

import { useEffect, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation' // Add useSearchParams
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

export const LoginSchema = z.object({
  username: z.string().min(4, {
    message: 'Username must be at least 4 characters long',
  }),
  password: z.string().min(1, {
    message: 'Password must enter a password',
  }),
})

export function Login() {
  const { login, isAuthenticated, fetching } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  useEffect(() => {
    // Check authentication status immediately
    if (hasCredentials() || isAuthenticated) {
      router.replace(returnUrl) // Replace '/' with returnUrl
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, returnUrl])

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    try {
      await login(data.username, data.password)
      // After successful login, redirect to returnUrl
      router.replace(returnUrl)
    } catch (error) {
      // Handle login error if needed
      console.error('Login failed:', error)
    }
  }

  // Show loading state
  if (isLoading || isAuthenticated) {
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
