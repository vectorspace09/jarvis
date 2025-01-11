"use client"

import { useEffect, useState } from 'react'
import { logger } from '@/store/logger-store'

interface AudioStats {
  sampleRate: number
  channelCount: number
  latency: number
  bufferSize: number
}

export function AudioStats() {
  const [stats, setStats] = useState<AudioStats>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let mounted = true

    async function getAudioStats() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        const audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        
        const stats = {
          sampleRate: audioContext.sampleRate,
          channelCount: source.channelCount,
          latency: audioContext.baseLatency * 1000,
          bufferSize: 2048 // Default WebAudio buffer size
        }

        setStats(stats)
        logger.info('Audio stats collected', stats)

        // Cleanup
        stream.getTracks().forEach(track => track.stop())
        audioContext.close()
      } catch (error) {
        logger.error('Failed to get audio stats:', error)
        setError('Could not access audio device')
      }
    }

    getAudioStats()

    return () => {
      mounted = false
    }
  }, [])

  if (error) {
    return <div className="text-xs text-destructive">{error}</div>
  }

  if (!stats) {
    return <div className="text-xs text-muted-foreground">Loading audio stats...</div>
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div>Sample Rate:</div>
      <div>{stats.sampleRate} Hz</div>
      <div>Channels:</div>
      <div>{stats.channelCount}</div>
      <div>Latency:</div>
      <div>{stats.latency.toFixed(2)} ms</div>
      <div>Buffer Size:</div>
      <div>{stats.bufferSize} samples</div>
    </div>
  )
} 