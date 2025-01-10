export type VoiceType = 'female' | 'male' | 'british' | 'american'
export type VoiceStyle = 'natural' | 'formal' | 'casual'
export type VoiceSpeed = 'slow' | 'normal' | 'fast'

export interface VoiceSettings {
  voice: VoiceType
  style: VoiceStyle
  speed: VoiceSpeed
  volume: number
  isMuted: boolean
} 