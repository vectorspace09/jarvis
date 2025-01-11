"use client"

import { useEffect, useRef } from 'react'

interface AudioMeterProps {
  type: 'input' | 'output'
}

export function AudioMeter({ type }: AudioMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyzerRef = useRef<AnalyserNode>()
  const streamRef = useRef<MediaStream>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const audioContext = new AudioContext()
    const analyzer = audioContext.createAnalyser()
    analyzer.fftSize = 256
    analyzerRef.current = analyzer

    async function setupAudio() {
      try {
        if (type === 'input') {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          })
          streamRef.current = stream
          const source = audioContext.createMediaStreamSource(stream)
          source.connect(analyzer)
        }
      } catch (error) {
        console.error('Audio setup error:', error)
      }
    }

    setupAudio()

    const dataArray = new Uint8Array(analyzer.frequencyBinCount)
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    function draw() {
      if (!ctx || !analyzer) return

      analyzer.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = `hsl(${average * 360 / 255}, 100%, 50%)`
      ctx.fillRect(0, 0, (average / 255) * canvasWidth, canvasHeight)

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      audioContext.close()
    }
  }, [type])

  return (
    <canvas 
      ref={canvasRef} 
      width={100} 
      height={10}
      className="border rounded"
    />
  )
} 