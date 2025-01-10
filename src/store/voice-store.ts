import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VoiceType, VoiceStyle, VoiceSpeed } from '@/types/voice'

interface VoiceState {
  voice: VoiceType
  style: VoiceStyle
  speed: VoiceSpeed
  volume: number
  isMuted: boolean
  setVoice: (voice: VoiceType) => void
  setStyle: (style: VoiceStyle) => void
  setSpeed: (speed: VoiceSpeed) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
}

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set) => ({
      voice: 'female',
      style: 'natural',
      speed: 'normal',
      volume: 100,
      isMuted: false,
      setVoice: (voice) => set({ voice }),
      setStyle: (style) => set({ style }),
      setSpeed: (speed) => set({ speed }),
      setVolume: (volume) => set({ volume }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    }),
    {
      name: 'voice-settings',
    }
  )
) 