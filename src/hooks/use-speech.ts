"use client"

import { useRef } from 'react'
import { toast } from 'react-hot-toast'

export function useSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = async (text: string) => {
    try {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) throw new Error('Failed to synthesize speech')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }

      audioRef.current = new Audio(audioUrl)
      await audioRef.current.play()
    } catch (error) {
      console.error('Speech error:', error)
      toast.error('Failed to speak response')
    }
  }

  return { speak }
} 