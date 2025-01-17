import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VoiceSettings, VoiceType, VoiceStyle, VoiceEmotion, VoiceSpeed } from '@/types/voice'
import { VOICE_PRESETS } from '@/lib/voice-presets'
import { logger } from '@/store/logger-store'

interface VoiceState extends VoiceSettings {
  setVoice: (voice: VoiceType) => void
  setStyle: (style: VoiceStyle) => void
  setEmotion: (emotion: VoiceEmotion) => void
  setSpeed: (speed: VoiceSpeed) => void
  setVolume: (volume: number) => void
  setPitch: (pitch: number) => void
  setStability: (stability: number) => void
  setClarity: (clarity: number) => void
  toggleMute: () => void
  applyPreset: (presetName: string) => void
  resetToDefault: () => void
  activePreset: string | null
}

const defaultSettings: VoiceSettings & { activePreset: string | null } = {
  voice: 'male',
  style: 'natural',
  emotion: 'neutral',
  speed: 'normal',
  volume: 100,
  pitch: 1.0,
  stability: 0.7,
  clarity: 0.8,
  isMuted: false,
  activePreset: null
}

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setVoice: (voice) => set({ voice }),
      setStyle: (style) => set({ style }),
      setEmotion: (emotion) => set({ emotion }),
      setSpeed: (speed) => set({ speed }),
      setVolume: (volume) => set({ volume }),
      setPitch: (pitch) => set({ pitch }),
      setStability: (stability) => set({ stability }),
      setClarity: (clarity) => set({ clarity }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      applyPreset: (presetName) => {
        const preset = VOICE_PRESETS[presetName]
        if (preset) {
          logger.info('Applying voice preset:', preset.name)
          set((state) => ({
            ...state,
            ...preset.settings,
            activePreset: presetName
          }))
        } else {
          logger.warn('Preset not found:', presetName)
        }
      },
      resetToDefault: () => {
        logger.info('Resetting voice settings to default')
        set(defaultSettings)
      }
    }),
    {
      name: 'voice-settings',
      version: 2,
    }
  )
) 