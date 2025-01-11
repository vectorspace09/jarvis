import { ChatContainer } from "@/components/chat/chat-container"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignOutButton } from "@/components/auth/sign-out-button"
import Link from "next/link"

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Jarvis</h1>
        <div className="flex items-center gap-4">
          <Link 
            href="/profile"
            className="text-sm hover:underline"
          >
            Profile
          </Link>
          <SignOutButton />
        </div>
      </header>
      <ChatContainer />
    </main>
  )
}
