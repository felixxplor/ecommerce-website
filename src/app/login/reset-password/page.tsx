'use client'

import { useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

const PasswordResetSchema = z.object({
  username: z.string().email({
    message: 'Please enter a valid email address',
  }),
})

type PasswordResetFormValues = z.infer<typeof PasswordResetSchema>

const PasswordResetForm = () => {
  const [resetError, setResetError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: {
      username: '',
    },
  })

  const onSubmit = async (data: PasswordResetFormValues) => {
    setResetError('')
    setIsSuccess(false)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: data.username }),
      })

      let responseData
      try {
        responseData = await response.json()
      } catch (error) {
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        throw new Error(responseData.errors?.message || 'Failed to send reset email')
      }

      setIsSuccess(true)
      form.reset()
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'An error occurred. Please try again.')
      console.error('Password reset failed:', error)
    }
  }

  return (
    <>
      <MaxWidthWrapper className="py-14">
        <h1 className="text-center text-4xl font-medium mb-3">Reset Your Password</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-screen-lg mx-auto px-4"
          >
            {resetError && (
              <Alert variant="destructive">
                <AlertDescription>{resetError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email address."
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {isSuccess && (
                    <div className="mt-2 p-3 text-sm text-green-700 border border-green-500 rounded-md bg-green-50">
                      If an account exists with this email, you will receive password reset
                      instructions shortly.
                    </div>
                  )}
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex gap-x-2 items-center"
            >
              Send Reset Link
              {form.formState.isSubmitting && <LoadingSpinner noText />}
            </Button>
          </form>
        </Form>
      </MaxWidthWrapper>
      <MainPolicies className="" />
    </>
  )
}

export default PasswordResetForm
