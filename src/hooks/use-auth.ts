'use client'

import { useSupabase } from '@/providers/supabase-provider'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { supabase, session } = useSupabase()
  const router = useRouter()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return {
    session,
    user: session?.user,
    signOut,
    isAuthenticated: !!session,
  }
} 