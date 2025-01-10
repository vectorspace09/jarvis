"use client"

import { useEffect, useState } from 'react'
import { Progress } from '../ui/progress'
import { audioQueue } from '@/lib/audio-queue'

export function AudioProgress() {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const unsubscribe = audioQueue.subscribe((state) => {
      setIsPlaying(state.isPlaying)
      setProgress(state.progress)
    })

    return () => {
      unsubscribe()
      return undefined
    }
  }, [])

  if (!isPlaying) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-64 bg-background border rounded-lg p-2 shadow-lg">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-center mt-1 text-muted-foreground">
        Speaking...
      </p>
    </div>
  )
} 