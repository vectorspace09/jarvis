"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "../ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useChatStore } from "@/store/chat-store"
import type { Message } from '@/types'
import { logger } from '@/store/logger-store'
import { ConversationManager } from '@/lib/voice/conversation-manager'
import { VoiceStatus } from './voice-status'

export function VoiceRecorder() {
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const setProcessing = useChatStore(state => state.setProcessing)
  const addMessage = useChatStore(state => state.addMessage)
  const processMessageStream = useChatStore(state => state.processMessageStream)
  
  const handleInterrupt = useCallback(() => {
    const manager = ConversationManager.getInstance()
    manager.interruptAgent()
  }, [])

  useEffect(() => {
    const manager = ConversationManager.getInstance()
    
    const handleStateChange = (state: any) => {
      if ('isListening' in state) setIsListening(state.isListening)
      if ('isRecording' in state) setIsRecording(state.isRecording)
      if ('isProcessing' in state) {
        setIsProcessing(state.isProcessing)
        setProcessing(state.isProcessing)
      }
    }

    const handleMessage = async (result: any) => {
      if (result.text?.trim()) {
        try {
          // Create user message
          const userMessage: Message = {
            role: 'user',
            content: result.text,
            language: result.detectedLanguage,
            timestamp: new Date().toISOString()
          }
          
          logger.info('Processing user message:', userMessage)
          
          // Use processMessageStream to handle the entire flow
          const response = await processMessageStream(userMessage)
          
          if (!response) {
            throw new Error('Failed to get response from assistant')
          }

          logger.info('Successfully processed message:', {
            userMessage,
            assistantResponse: response
          })

        } catch (error) {
          logger.error('Error in handleMessage:', error)
          toast.error('Failed to process message')
        }
      }
    }

    const handleError = (error: { message: string; error: any }) => {
      setError(new Error(error.message))
      toast.error(error.message)
    }

    manager.on('stateChange', handleStateChange)
    manager.on('message', handleMessage)
    manager.on('error', handleError)

    return () => {
      if (manager) {
        manager.removeListener('stateChange', handleStateChange)
        manager.removeListener('message', handleMessage)
        manager.removeListener('error', handleError)
        manager.endConversation()
      }
    }
  }, [addMessage, processMessageStream, setProcessing])

  const toggleConversation = async () => {
    const manager = ConversationManager.getInstance()
    
    if (isListening) {
      logger.info('Ending conversation...')
      manager.endConversation()
    } else {
      logger.info('Starting conversation...')
      try {
        // Test microphone access first
        logger.info('Testing microphone access...')
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop()) // Clean up test stream
        
        logger.info('Microphone access granted, starting conversation...')
        await manager.startConversation()
      } catch (error) {
        logger.error('Microphone access error:', error)
        toast.error('Unable to access microphone')
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <VoiceStatus 
        isListening={isListening}
        isRecording={isRecording}
        isProcessing={isProcessing}
        onInterrupt={handleInterrupt}
      />
      <Button 
        onClick={toggleConversation}
        variant={isListening ? "destructive" : "default"}
        size="icon"
        className="rounded-full w-16 h-16"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
} 