'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '../ui/button'

export function SignOutButton() {
  const { signOut } = useAuth()

  return (
    <Button variant="ghost" onClick={signOut}>
      Sign Out
    </Button>
  )
} 