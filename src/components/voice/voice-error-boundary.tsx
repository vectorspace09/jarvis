'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@/store/logger-store'
import { toast } from 'react-hot-toast'
import { ConversationManager } from '@/lib/voice/conversation-manager'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class VoiceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      error: error
    }
  }

  public componentDidCatch(error: Error) {
    this.setState({ hasError: true, error })
    const conversation = ConversationManager.getInstance()
    if (conversation) {
      conversation.endConversation()
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <button
          onClick={this.handleRetry}
          className="rounded-full w-16 h-16 bg-destructive text-destructive-foreground flex items-center justify-center"
        >
          Retry
        </button>
      )
    }

    return this.props.children
  }
} 