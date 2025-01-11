"use client"

import { useEffect, useState } from 'react'

export function NetworkStats() {
  const [stats, setStats] = useState({
    rtt: 0,
    downlink: 0,
    effectiveType: ''
  })

  useEffect(() => {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      
      const updateStats = () => {
        setStats({
          rtt: conn.rtt,
          downlink: conn.downlink,
          effectiveType: conn.effectiveType
        })
      }

      conn.addEventListener('change', updateStats)
      updateStats()

      return () => conn.removeEventListener('change', updateStats)
    }
  }, [])

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div>Network Type:</div>
      <div>{stats.effectiveType}</div>
      <div>RTT:</div>
      <div>{stats.rtt}ms</div>
      <div>Bandwidth:</div>
      <div>{stats.downlink}Mbps</div>
    </div>
  )
} 