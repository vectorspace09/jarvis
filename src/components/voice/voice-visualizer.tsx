"use client"

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Loader2, Volume2, AlertCircle } from 'lucide-react'

interface VoiceVisualizerProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
  className?: string
  onInterrupt?: () => void
}

export function VoiceVisualizer({ state, className, onInterrupt }: VoiceVisualizerProps) {
  const bars = 12 // More bars for better visualization
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animation variants for different states
  const variants = {
    idle: (i: number) => ({
      scaleY: 0.5,
      opacity: 0.3,
      transition: {
        duration: 0.4,
      }
    }),
    listening: (i: number) => ({
      scaleY: [0.5, 1.5, 0.5],
      opacity: 0.8,
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: i * 0.1,
        ease: "easeInOut",
      }
    }),
    processing: (i: number) => ({
      scaleY: 1,
      opacity: [0.3, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        delay: i * 0.05,
        ease: "circInOut",
      }
    }),
    speaking: (i: number) => ({
      scaleY: [0.8, 1.5, 0.8],
      opacity: 1,
      transition: {
        duration: 0.5,
        repeat: Infinity,
        delay: i * 0.08,
        ease: "easeOut",
      }
    }),
    error: (i: number) => ({
      scaleY: 0.5,
      opacity: [0.2, 1],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        ease: "anticipate",
      }
    })
  }

  // Colors with better contrast and meaning
  const stateColors = {
    idle: 'bg-muted/50 dark:bg-muted/30',
    listening: 'bg-blue-500/90 dark:bg-blue-400/90',
    processing: 'bg-amber-500/90 dark:bg-amber-400/90',
    speaking: 'bg-emerald-500/90 dark:bg-emerald-400/90',
    error: 'bg-red-500/90 dark:bg-red-400/90'
  }

  // Icons for different states
  const StateIcon = {
    idle: Mic,
    listening: Mic,
    processing: Loader2,
    speaking: Volume2,
    error: AlertCircle
  }[state]

  return (
    <div className={cn("relative flex flex-col items-center gap-4", className)}>
      {/* State icon */}
      <div className="absolute -top-8">
        <StateIcon 
          className={cn(
            "w-5 h-5",
            state === 'processing' && "animate-spin",
            state === 'speaking' && "animate-pulse",
            stateColors[state].replace('bg-', 'text-')
          )}
        />
      </div>

      {/* Visualization bars */}
      <div className="flex items-center justify-center gap-[2px] h-12 w-32">
        <AnimatePresence>
          {[...Array(bars)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              className={cn(
                "w-1 rounded-full",
                stateColors[state]
              )}
              initial={{ scaleY: 0.5, opacity: 0.3 }}
              animate={state}
              variants={variants}
              style={{ transformOrigin: 'bottom' }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Interrupt button - only show when agent is speaking */}
      {state === 'speaking' && onInterrupt && (
        <button
          onClick={onInterrupt}
          className="absolute -right-10 p-1.5 rounded-full bg-muted/10 hover:bg-muted/20 transition-colors"
          title="Interrupt agent"
        >
          <MicOff className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  )
} 