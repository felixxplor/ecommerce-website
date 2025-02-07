'use client'
import Link from 'next/link'
import { User } from 'lucide-react'
import { useSession } from '@/client/session-provider'
import { usePathname } from 'next/navigation'

export default function UserLink() {
  const { isAuthenticated } = useSession()
  const currentPath = usePathname()

  const loginUrl = `/login?returnUrl=${encodeURIComponent(currentPath)}`

  return (
    <Link href={isAuthenticated ? '/account' : loginUrl} className="py-2 px-3 inline-block">
      <User className="h-6 w-6" stroke="#09090B" strokeWidth={1} />
    </Link>
  )
}
