import type { VoiceSettings } from '@/types/voice'
import { VOICE_PRESETS } from './voice-presets'

export function getCurrentPreset(settings: VoiceSettings): string | null {
  for (const [key, preset] of Object.entries(VOICE_PRESETS)) {
    const isMatch = Object.entries(preset.settings).every(
      ([setting, value]) => settings[setting as keyof VoiceSettings] === value
    )
    if (isMatch) return key
  }
  return null
} 