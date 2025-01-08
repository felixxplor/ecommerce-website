'use client'

import { useEffect, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation' // Add useSearchParams
import { useSession } from './session-provider'
import { hasCredentials } from '@/utils/session'
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

// Schema remains the same
export const RegisterSchema = z
  .object({
    username: z.string().min(4, {
      message: 'Username must be at least 4 characters long',
    }),
    email: z.string().email({
      message: 'Please enter a valid email address',
    }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters long',
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export function Register() {
  const { register, isAuthenticated, fetching } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
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

  const onSubmit = async (data: z.infer<typeof RegisterSchema>) => {
    try {
      await register(data.username, data.email, data.password)
      // After successful registration, redirect to returnUrl
      router.replace(returnUrl)
    } catch (error) {
      // Handle registration error if needed
      console.error('Registration failed:', error)
    }
  }

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
                  <Input placeholder="Choose a username for your account" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email address" {...field} />
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
                  <Input type="password" placeholder="Create a secure password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={fetching} className="flex gap-x-2 items-center">
            Register
            {fetching && <LoadingSpinner noText />}
          </Button>
        </form>
      </Form>
    </MaxWidthWrapper>
  )
}
