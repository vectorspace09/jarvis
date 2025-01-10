"use client"

import { useState, useRef } from "react"
import { Button } from "../ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useChatStore } from "@/store/chat-store"
import type { Message } from '@/types'

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const addMessage = useChatStore(state => state.addMessage)
  const setProcessing = useChatStore(state => state.setProcessing)
  const processMessageStream = useChatStore(state => state.processMessageStream)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        await processAudio(audioBlob)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Unable to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to transcribe audio')

      const { text, detectedLanguage } = await response.json()

      // Add transcribed text to chat with detected language
      const message: Message = {
        role: 'user' as const,
        content: text,
        language: detectedLanguage,
        timestamp: new Date().toISOString()
      }
      await processMessageStream(message)

    } catch (error) {
      console.error('Error processing audio:', error)
      toast.error('Failed to process audio')
    } finally {
      setIsProcessing(false)
      setProcessing(false)
    }
  }

  return (
    <Button 
      onClick={isRecording ? stopRecording : startRecording}
      variant={isRecording ? "destructive" : "default"}
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
  )
} 