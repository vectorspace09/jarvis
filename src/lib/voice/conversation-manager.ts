import EventEmitter from 'events'
import type { VoiceState, VoiceConfig, TranscriptionResult } from '@/types/voice'
import { VoiceProcessor } from './voice-processor'
import { VoiceActivityDetector } from './vad-service'
import { audioQueue } from '@/lib/audio-queue'
import { logger } from '@/store/logger-store'

const DEFAULT_CONFIG: VoiceConfig = {
  silenceThreshold: 0.1,
  silenceTimeout: 1000,
  minAudioSize: 4000,
  maxRecordingDuration: 30000,
  sampleRate: 16000,
  channels: 1
}

export class ConversationManager extends EventEmitter {
  private static instance: ConversationManager
  private state: VoiceState
  private config: VoiceConfig
  private vad: VoiceActivityDetector | null = null
  private processor: VoiceProcessor
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private timeouts: Map<string, NodeJS.Timeout> = new Map()
  private wasInterrupted: boolean = false

  private constructor(config: Partial<VoiceConfig> = {}) {
    super()
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.processor = VoiceProcessor.getInstance()
    this.state = {
      isListening: false,
      isRecording: false,
      isProcessing: false,
      isAgentSpeaking: false,
      error: null
    }

    // Improved audio queue subscription
    audioQueue.subscribe(({ isPlaying }) => {
      if (this.state.isAgentSpeaking !== isPlaying) {
        this.updateState({ 
          isAgentSpeaking: isPlaying,
          isRecording: false // Always stop recording when agent starts speaking
        })
        
        if (!isPlaying && this.state.isListening) {
          // Only auto-resume if we weren't interrupted
          if (!this.wasInterrupted) {
            setTimeout(() => {
              if (this.state.isListening && !this.state.isProcessing) {
                this.resumeListening()
              }
            }, 1500)
          }
          this.wasInterrupted = false
        }
      }
    })
  }

  static getInstance(config?: Partial<VoiceConfig>): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager(config)
    }
    return ConversationManager.instance
  }

  private updateState(updates: Partial<VoiceState>) {
    if (this.state.isAgentSpeaking) {
      updates = {
        ...updates,
        isRecording: false,
        isProcessing: false
      }
    }

    this.state = { ...this.state, ...updates }
    this.emit('stateChange', this.state)
    logger.info('Voice state updated:', this.state)
  }

  private scheduleTimeout(id: string, callback: () => void, delay: number) {
    this.clearTimeout(id)
    const timeout = setTimeout(callback, delay)
    this.timeouts.set(id, timeout)
  }

  private clearTimeout(id: string) {
    const timeout = this.timeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(id)
    }
  }

  private clearAllTimeouts() {
    this.timeouts.forEach(timeout => clearTimeout(timeout))
    this.timeouts.clear()
  }

  async startConversation() {
    try {
      if (this.state.isListening) return

      this.updateState({ 
        isListening: true,
        error: null
      })

      await this.resumeListening()
      logger.info('Started conversation')
    } catch (error) {
      this.handleError('Failed to start conversation', error)
      throw error
    }
  }

  private async resumeListening() {
    if (this.state.isAgentSpeaking) {
      logger.info('Skipping resume - agent is speaking')
      return
    }

    try {
      if (!this.vad) {
        this.vad = new VoiceActivityDetector({
          ...this.config,
          silenceThreshold: 0.15, // Increase threshold
          silenceTimeout: 1200,   // Longer silence timeout
        })
        await this.vad.init()
      }

      this.vad.start(
        // Speech detected
        () => {
          if (!this.state.isProcessing && !this.state.isAgentSpeaking) {
            this.startRecording()
          }
        },
        // Speech ended
        () => {
          if (this.state.isRecording) {
            this.scheduleTimeout('stopRecording', () => {
              this.stopRecordingAndProcess()
            }, this.config.silenceTimeout)
          }
        }
      )
    } catch (error) {
      this.handleError('Failed to resume listening', error)
    }
  }

  private startRecording() {
    // Don't start if already recording or agent is speaking
    if (this.mediaRecorder || this.state.isProcessing || this.state.isAgentSpeaking) {
      logger.info('Skipping recording start - conditions not met', {
        hasRecorder: !!this.mediaRecorder,
        isProcessing: this.state.isProcessing,
        isAgentSpeaking: this.state.isAgentSpeaking
      })
      return
    }

    navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: this.config.channels,
        sampleRate: this.config.sampleRate
      }
    }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: this.config.sampleRate
      })

      this.audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start(100)
      this.updateState({ isRecording: true })

      // Shorter max recording duration
      this.scheduleTimeout('maxRecording', () => {
        if (this.state.isRecording) {
          this.stopRecordingAndProcess()
        }
      }, 15000) // 15 seconds max

    }).catch(error => {
      this.handleError('Failed to start recording', error)
    })
  }

  private stopRecordingAndProcess() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') return

    const currentRecorder = this.mediaRecorder
    this.mediaRecorder = null

    currentRecorder.stop()
    currentRecorder.stream.getTracks().forEach(track => track.stop())
    
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
    this.updateState({ isRecording: false })

    if (audioBlob.size >= this.config.minAudioSize) {
      this.processAudio(audioBlob)
    } else {
      logger.info('Audio too short, skipping', { size: audioBlob.size })
      if (this.state.isListening) {
        this.resumeListening()
      }
    }
  }

  private async processAudio(audioBlob: Blob) {
    // Increase minimum audio size to avoid processing noise
    if (audioBlob.size < this.config.minAudioSize) {
      logger.info('Audio too short, skipping', { size: audioBlob.size })
      if (this.state.isListening) {
        this.resumeListening()
      }
      return
    }

    this.updateState({ isProcessing: true })

    try {
      const result = await this.processor.processAudio(audioBlob)
      
      // Only process if we have meaningful text
      if (result.text?.trim()) {
        this.emit('message', result)
      } else {
        logger.info('Empty result, resuming listening')
        if (this.state.isListening) {
          this.resumeListening()
        }
      }
    } catch (error) {
      this.handleError('Processing error', error)
    } finally {
      this.updateState({ isProcessing: false })
    }
  }

  private handleError(message: string, error: any) {
    logger.error(message, error)
    this.updateState({ error: message })
    this.emit('error', { message, error })
    this.cleanup()
  }

  endConversation() {
    this.cleanup()
    this.updateState({
      isListening: false,
      isRecording: false,
      isProcessing: false,
      error: null
    })
    logger.info('Ended conversation')
  }

  private cleanup() {
    this.clearAllTimeouts()
    
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop()
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
      this.mediaRecorder = null
    }

    if (this.vad) {
      this.vad.stop()
      this.vad = null
    }
  }

  interruptAgent() {
    if (this.state.isAgentSpeaking) {
      audioQueue.clear() // Stop current and queued speech
      this.updateState({ 
        isAgentSpeaking: false,
        isRecording: false,
        isProcessing: false
      })
      
      // Small delay before resuming listening
      setTimeout(() => {
        if (this.state.isListening) {
          this.resumeListening()
        }
      }, 500)
    }
  }
} 