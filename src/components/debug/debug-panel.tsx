"use client"

import { AudioMeter } from './audio-meter'
import { AudioStats } from './audio-stats'
import { PerformanceStats } from './performance-stats'
import { NetworkStats } from './network-stats'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoggerStore } from '@/store/logger-store'
import { useChatStore } from '@/store/chat-store'
import { useVoiceStore } from '@/store/voice-store'
import { Bug, Mic, Volume2, Maximize2, Minimize2, MessageSquare, Activity, Copy, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { toast } from 'react-hot-toast'

type TabType = 'logs' | 'state' | 'audio' | 'debug'

export function DebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('logs')
  const [isCopied, setIsCopied] = useState(false)
  const logs = useLoggerStore(state => state.logs)
  const chatState = useChatStore()
  const voiceState = useVoiceStore()

  const copyDebugData = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      chatState: {
        messages: chatState.messages,
        messageCount: chatState.messages.length,
        context: chatState.context,
        currentLanguage: chatState.currentLanguage
      },
      voiceState: {
        isListening: voiceState.isListening,
        isRecording: voiceState.isRecording,
        isProcessing: voiceState.isProcessing,
        isAgentSpeaking: voiceState.isAgentSpeaking,
        error: voiceState.error
      },
      recentLogs: logs.slice(-20)
    }

    navigator.clipboard.writeText(JSON.stringify(debugData, null, 2))
    setIsCopied(true)
    toast.success('Debug data copied to clipboard')
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <motion.div 
      className="fixed bottom-4 left-4 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden z-50"
      animate={{ 
        width: isExpanded ? '500px' : '48px', 
        height: isExpanded ? '400px' : '48px',
        opacity: 0.95
      }}
    >
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          <span className={`${!isExpanded && 'hidden'}`}>Debug Panel</span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={copyDebugData}
              className="h-8 w-8"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[calc(100%-48px)]"
          >
            <div className="flex border-b">
              <Button
                variant={activeTab === 'logs' ? 'secondary' : 'ghost'}
                className="rounded-none flex-1"
                onClick={() => setActiveTab('logs')}
              >
                Logs
              </Button>
              <Button
                variant={activeTab === 'state' ? 'secondary' : 'ghost'}
                className="rounded-none flex-1"
                onClick={() => setActiveTab('state')}
              >
                State
              </Button>
              <Button
                variant={activeTab === 'audio' ? 'secondary' : 'ghost'}
                className="rounded-none flex-1"
                onClick={() => setActiveTab('audio')}
              >
                Audio
              </Button>
              <Button
                variant={activeTab === 'debug' ? 'secondary' : 'ghost'}
                className="rounded-none flex-1"
                onClick={() => setActiveTab('debug')}
              >
                <Activity className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 h-full overflow-auto">
              {activeTab === 'logs' && (
                <div className="space-y-2">
                  {logs.slice(-50).map((log, i) => (
                    <div 
                      key={i}
                      className={`text-xs font-mono ${
                        log.type === 'error' ? 'text-destructive' :
                        log.type === 'warn' ? 'text-warning' :
                        'text-muted-foreground'
                      }`}
                    >
                      <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className="ml-2">{log.message}</span>
                      {log.details && (
                        <pre className="mt-1 p-1 bg-muted rounded text-[10px] overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'state' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Voice State
                    </h3>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify({
                        isListening: voiceState.isListening,
                        isRecording: voiceState.isRecording,
                        isProcessing: voiceState.isProcessing,
                        isAgentSpeaking: voiceState.isAgentSpeaking,
                        currentLanguage: chatState.currentLanguage,
                        error: voiceState.error
                      }, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Chat State
                    </h3>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify({
                        messages: chatState.messages,
                        messageCount: chatState.messages.length,
                        lastMessage: chatState.messages[chatState.messages.length - 1]?.content,
                        context: chatState.context,
                        currentLanguage: chatState.currentLanguage
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      <span className="text-xs">Input Level</span>
                      <AudioMeter type="input" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span className="text-xs">Output Level</span>
                      <AudioMeter type="output" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Audio Stats</h3>
                    <AudioStats />
                  </div>
                </div>
              )}

              {activeTab === 'debug' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Performance</h3>
                    <PerformanceStats />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Network</h3>
                    <NetworkStats />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 