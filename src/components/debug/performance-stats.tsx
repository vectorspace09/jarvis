"use client"

import { useEffect, useState } from 'react'
import { logger } from '@/store/logger-store'

interface PerformanceStats {
  responseTime: number[]  // Last 5 response times
  audioLatency: number[] // Last 5 audio processing latencies
  memoryUsage: number    // JS heap size
}

export function PerformanceStats() {
  const [stats, setStats] = useState<PerformanceStats>({
    responseTime: [],
    audioLatency: [],
    memoryUsage: 0
  })

  useEffect(() => {
    const interval = setInterval(() => {
      // @ts-ignore - performance.memory is Chrome-specific
      const memory = performance?.memory?.usedJSHeapSize || 0
      
      setStats(prev => ({
        ...prev,
        memoryUsage: Math.round(memory / (1024 * 1024))
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div>Avg Response Time:</div>
      <div>
        {stats.responseTime.length > 0
          ? `${(stats.responseTime.reduce((a, b) => a + b) / stats.responseTime.length).toFixed(0)}ms`
          : 'N/A'}
      </div>
      <div>Memory Usage:</div>
      <div>{stats.memoryUsage}MB</div>
    </div>
  )
} 