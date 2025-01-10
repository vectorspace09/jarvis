export const VOICE_IDS = {
  en: {
    male: "ErXwobaYiN019PkySvjV",    // Antoni - Professional male
    female: "21m00Tcm4TlvDq8ikWAM",  // Rachel - Natural female
    british: "pNInz6obpgDQGcFmaJgB", // Harry - British male
    american: "EXAVITQu4vr4xnSDxMaL" // Josh - American male
  },
  es: "3KZh6qNCNNtqEYEGUGxd",        // Spanish male
  fr: "8pfkZAxhxZXQZXbkqxg1",        // French male
  de: "jsCqWAovK2LkecY7zXl4",        // German male
  // Add more languages as needed
}

export type VoiceSettings = {
  stability: number          // 0-1: Lower for more variation
  similarity_boost: number   // 0-1: Higher for more similar to original
  style: number             // 0-1: Higher for more expressive
  use_speaker_boost: boolean // Enhance clarity
  speaking_rate: number      // 0.5-2.0: Speed multiplier
}

export const VOICE_PRESETS = {
  natural: {
    stability: 0.35,
    similarity_boost: 0.75,
    style: 0.7,
    use_speaker_boost: true,
    speaking_rate: 1.1
  },
  formal: {
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.3,
    use_speaker_boost: true,
    speaking_rate: 1.0
  },
  casual: {
    stability: 0.3,
    similarity_boost: 0.6,
    style: 0.8,
    use_speaker_boost: true,
    speaking_rate: 1.2
  }
} 