import type { VoicePreset } from '@/types/voice'

export const VOICE_PRESETS: Record<string, VoicePreset> = {
  jarvis: {
    name: 'Jarvis',
    settings: {
      voice: 'male',
      style: 'formal',
      emotion: 'neutral',
      speed: 'normal',
      pitch: 1.0,
      stability: 0.8,
      clarity: 0.9
    },
    description: 'Professional AI assistant voice'
  },
  friendly: {
    name: 'Friendly',
    settings: {
      voice: 'female',
      style: 'casual',
      emotion: 'happy',
      speed: 'normal',
      pitch: 1.1,
      stability: 0.6,
      clarity: 0.8
    },
    description: 'Warm and approachable voice'
  },
  professional: {
    name: 'Professional',
    settings: {
      voice: 'british',
      style: 'formal',
      emotion: 'neutral',
      speed: 'normal',
      pitch: 0.9,
      stability: 0.9,
      clarity: 1.0
    },
    description: 'Clear and professional voice'
  }
} 