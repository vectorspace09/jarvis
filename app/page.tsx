import { ChatContainer } from "@/components/chat/chat-container"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold text-center">Jarvis</h1>
      </header>
      <ChatContainer />
    </main>
  )
}
