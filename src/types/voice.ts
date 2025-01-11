export type VoiceType = 'female' | 'male' | 'british' | 'american'
export type VoiceStyle = 'natural' | 'formal' | 'casual' | 'cheerful' | 'serious'
export type VoiceEmotion = 'neutral' | 'happy' | 'sad' | 'excited' | 'calm'
export type VoiceSpeed = 'very-slow' | 'slow' | 'normal' | 'fast' | 'very-fast'

export interface VoiceSettings {
  voice: VoiceType
  style: VoiceStyle
  emotion: VoiceEmotion
  speed: VoiceSpeed
  volume: number
  pitch: number
  stability: number
  clarity: number
  isMuted: boolean
}

export interface VoicePreset {
  name: string
  settings: Partial<VoiceSettings>
  description: string
}

export interface VoiceState extends VoiceSettings {
  isListening: boolean
  isRecording: boolean
  isProcessing: boolean
  isAgentSpeaking: boolean
  error: string | null
  activePreset: string | null
}

export interface VoiceConfig {
  silenceThreshold: number
  silenceTimeout: number
  minAudioSize: number
  maxRecordingDuration: number
  sampleRate: number
  channels: number
}

export interface TranscriptionResult {
  text: string
  detectedLanguage: string
  confidence: number
}

export type VoiceEventType = 
  | 'stateChange' 
  | 'message' 
  | 'error' 
  | 'audioStart' 
  | 'audioEnd' 