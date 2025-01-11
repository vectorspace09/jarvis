import type { VoiceSettings } from '@/types/voice'

export function validateVoiceSettings(settings: Partial<VoiceSettings>): VoiceSettings {
  const defaults: VoiceSettings = {
    voice: 'female',
    style: 'natural',
    emotion: 'neutral',
    speed: 'normal',
    volume: 1,
    pitch: 1,
    stability: 0.75,
    clarity: 0.75,
    isMuted: false
  }

  return {
    ...defaults,
    ...settings,
    // Clamp numeric values
    volume: clamp(settings.volume ?? defaults.volume, 0, 1),
    pitch: clamp(settings.pitch ?? defaults.pitch, 0.5, 2),
    stability: clamp(settings.stability ?? defaults.stability, 0, 1),
    clarity: clamp(settings.clarity ?? defaults.clarity, 0, 1)
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
} 