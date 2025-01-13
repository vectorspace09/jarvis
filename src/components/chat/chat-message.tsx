import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  // Add error boundary
  if (!message || !message.content) {
    console.error('Invalid message:', message)
    return null
  }

  return (
    <motion.div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}
      >
        {message.content}
      </div>
    </motion.div>
  )
} 