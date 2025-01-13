import { logger } from '@/store/logger-store'
import type { VoiceConfig } from '@/types/voice'

export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null
  private analyzer: AnalyserNode | null = null
  private mediaStream: MediaStream | null = null
  private isListening = false
  private active = true
  private config: VoiceConfig
  private onSpeechStart: (() => void) | null = null
  private onSpeechEnd: (() => void) | null = null
  private silenceTimeout: NodeJS.Timeout | null = null
  private isSpeaking = false
  private speakingHistory: boolean[] = []
  private readonly HISTORY_SIZE = 3
  private lastAnalysisTime = 0
  private readonly ANALYSIS_INTERVAL = 25 // ms between analyses
  private isProcessing = false

  constructor(config: VoiceConfig) {
    this.config = config
  }

  private static checkBrowserSupport() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Audio input not supported');
    }
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext not supported');
    }
  }

  async init() {
    try {
      VoiceActivityDetector.checkBrowserSupport();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: this.config.channels,
          sampleRate: this.config.sampleRate
        } 
      })

      this.audioContext = new AudioContextClass({ sampleRate: this.config.sampleRate })
      const source = this.audioContext.createMediaStreamSource(this.mediaStream)
      this.analyzer = this.audioContext.createAnalyser()
      this.analyzer.fftSize = 512
      this.analyzer.smoothingTimeConstant = 0.3
      source.connect(this.analyzer)

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
    } catch (error) {
      logger.error('Failed to initialize VAD:', error)
      throw error
    }
  }

  private async monitor() {
    if (!this.isListening || !this.analyzer || !this.audioContext) return;
    
    // Ensure audio context is running
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        logger.error('Failed to resume audio context:', error);
        return;
      }
    }

    const now = Date.now()
    if (now - this.lastAnalysisTime < this.ANALYSIS_INTERVAL) {
      requestAnimationFrame(() => this.monitor())
      return
    }
    this.lastAnalysisTime = now

    const dataArray = new Uint8Array(this.analyzer.frequencyBinCount)
    this.analyzer.getByteFrequencyData(dataArray)

    // Focus on speech frequencies (85-255 Hz)
    const speechFreqData = dataArray.slice(1, 6)
    const average = speechFreqData.reduce((a, b) => a + b) / speechFreqData.length
    const volume = average / 256

    // Update speaking history
    this.speakingHistory.push(volume > this.config.silenceThreshold)
    if (this.speakingHistory.length > this.HISTORY_SIZE) {
      this.speakingHistory.shift()
    }

    // Check if majority of recent samples indicate speaking
    const isSpeakingNow = this.speakingHistory.filter(Boolean).length > this.HISTORY_SIZE / 2

    if (isSpeakingNow && !this.isSpeaking) {
      this.isSpeaking = true
      this.onSpeechStart?.()
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout)
        this.silenceTimeout = null
      }
    } else if (!isSpeakingNow && this.isSpeaking) {
      if (!this.silenceTimeout) {
        this.silenceTimeout = setTimeout(() => {
          this.isSpeaking = false
          this.speakingHistory = []
          this.onSpeechEnd?.()
        }, this.config.silenceTimeout)
      }
    }

    if (this.isListening) {
      requestAnimationFrame(() => this.monitor())
    }
  }

  start(onSpeechStart: () => void, onSpeechEnd: () => void) {
    if (!this.analyzer) throw new Error('VAD not initialized');
    
    this.onSpeechStart = () => {
      // Only trigger speech start if we're not already processing
      if (!this.isProcessing) {
        onSpeechStart();
      }
    };
    this.onSpeechEnd = onSpeechEnd;
    this.isListening = true;
    this.speakingHistory = [];
    this.lastAnalysisTime = 0;
    this.monitor();
  }

  stop() {
    this.isListening = false
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout)
      this.silenceTimeout = null
    }
    this.cleanup()
  }

  private cleanup() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.analyzer = null
    this.speakingHistory = []
    this.lastAnalysisTime = 0
  }

  pause() {
    this.active = false
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.enabled = false)
    }
  }

  resume() {
    this.active = true
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.enabled = true)
    }
  }

  onAudioProcess(event: AudioProcessingEvent) {
    if (!this.active) return; // Skip processing if paused
    
    // Rest of the audio processing code...
  }

  setProcessing(processing: boolean) {
    this.isProcessing = processing;
  }
} 