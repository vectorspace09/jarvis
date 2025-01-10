"use client"

import { useLoggerStore } from '@/store/logger-store'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { useState } from 'react'
import { AlertCircle, Info, AlertTriangle, Copy, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function Logger() {
  const [isOpen, setIsOpen] = useState(false)
  const { logs, clearLogs } = useLoggerStore()

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}${log.details ? `\nDetails: ${JSON.stringify(log.details, null, 2)}` : ''}`
    ).join('\n\n')
    
    navigator.clipboard.writeText(logText)
    toast.success('Logs copied to clipboard')
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        Show Logs
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-background border rounded-lg shadow-lg z-50 flex flex-col">
      <div className="p-2 border-b flex items-center justify-between">
        <h3 className="font-semibold">Debug Logs</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearLogs}>
            Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={copyLogs}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {logs.map((log, index) => (
            <div
              key={index}
              className="text-sm font-mono rounded border p-2"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                {log.type === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                {log.type === 'info' && <Info className="h-4 w-4 text-primary" />}
                {log.type === 'warn' && <AlertTriangle className="h-4 w-4 text-warning" />}
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div>{log.message}</div>
              {log.details && (
                <pre className="mt-1 text-xs bg-muted p-1 rounded overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 