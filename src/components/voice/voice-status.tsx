"use client"

import { useEffect, useState } from 'react'
import { VoiceVisualizer } from './voice-visualizer'
import { audioQueue } from '@/lib/audio-queue'
import type { Unsubscribe } from '@/types/audio'

interface VoiceStatusProps {
  isListening: boolean
  isRecording: boolean
  isProcessing: boolean
  onInterrupt?: () => void
}

export function VoiceStatus({ 
  isListening, 
  isRecording, 
  isProcessing,
  onInterrupt
}: VoiceStatusProps) {
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe: Unsubscribe = audioQueue.subscribe(({ isPlaying }) => {
      setIsAgentSpeaking(isPlaying)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Determine the current state
  const getVisualizerState = () => {
    if (error) return 'error'
    if (isProcessing) return 'processing'
    if (isAgentSpeaking) return 'speaking'
    if (isRecording) return 'listening'
    if (isListening) return 'idle'
    return 'idle'
  }

  const getStatusMessage = () => {
    if (error) {
      if (error.includes('synthesis')) {
        return 'Voice synthesis failed. Please try again.'
      }
      if (error.includes('microphone')) {
        return 'Microphone access denied. Please enable it.'
      }
      return error
    }

    return isProcessing ? 'Processing...' : 
           isAgentSpeaking ? 'Speaking...' :
           isRecording ? 'Listening...' :
           isListening ? 'Ready' : 
           'Click mic to start'
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <VoiceVisualizer 
        state={getVisualizerState()}
        className="mb-2"
        onInterrupt={onInterrupt}
      />
      <div className="text-sm text-muted-foreground">
        <span className={error ? 'text-destructive' : ''}>
          {getStatusMessage()}
        </span>
      </div>
    </div>
  )
} 