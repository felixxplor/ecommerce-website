import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { changePassword } from '@/utils/session'
import { useToast } from '@/hooks/use-toast'

export default function PasswordChangeForm() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'New passwords do not match',
      }))
      return
    }

    setIsSaving(true)

    try {
      const result = await changePassword(currentPassword, newPassword)

      if (result === true) {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        })

        // Reset form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        // Handle specific error cases
        setErrors((prev) => ({
          ...prev,
          currentPassword: 'Current password is incorrect',
        }))
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setErrors((prev) => ({
        ...prev,
        currentPassword: 'Failed to change password',
      }))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handlePasswordChange}>
      <h2 className="text-xl font-semibold mb-6">Change Password</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value)
              if (errors.currentPassword) {
                setErrors((prev) => ({ ...prev, currentPassword: '' }))
              }
            }}
            required
            className={errors.currentPassword ? 'border-red-500' : ''}
          />
          {errors.currentPassword && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.currentPassword}</AlertDescription>
            </Alert>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              if (errors.newPassword) {
                setErrors((prev) => ({ ...prev, newPassword: '' }))
              }
            }}
            required
            className={errors.newPassword ? 'border-red-500' : ''}
          />
          {errors.newPassword && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.newPassword}</AlertDescription>
            </Alert>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }
            }}
            required
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errors.confirmPassword}</AlertDescription>
            </Alert>
          )}
        </div>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Changing...' : 'Change Password'}
        </Button>
      </div>
    </form>
  )
}
