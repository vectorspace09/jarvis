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
}

export class VoiceErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Voice system error:', {
      error: error.message,
      stack: errorInfo.componentStack
    })
    
    // Attempt recovery
    const manager = ConversationManager.getInstance()
    manager.endConversation()
    
    toast.error('Voice system encountered an error. Click to retry.')
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