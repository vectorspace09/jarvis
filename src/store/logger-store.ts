import { create } from 'zustand'

interface LogEntry {
  timestamp: string
  type: 'info' | 'error' | 'warn'
  message: string
  details?: any
}

interface LoggerState {
  logs: LogEntry[]
  addLog: (type: LogEntry['type'], message: string, details?: any) => void
  clearLogs: () => void
}

export const useLoggerStore = create<LoggerState>((set) => ({
  logs: [],
  addLog: (type, message, details) => set((state) => ({
    logs: [...state.logs, {
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    }]
  })),
  clearLogs: () => set({ logs: [] })
}))

// Helper function to use throughout the app
export const logger = {
  info: (message: string, details?: any) => useLoggerStore.getState().addLog('info', message, details),
  error: (message: string, details?: any) => useLoggerStore.getState().addLog('error', message, details),
  warn: (message: string, details?: any) => useLoggerStore.getState().addLog('warn', message, details)
} 