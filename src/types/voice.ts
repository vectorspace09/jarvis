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