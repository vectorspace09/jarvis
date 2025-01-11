import { logger } from '@/store/logger-store'

export function detectLanguage(text: string): string {
  // Normalize the text by removing special characters and extra spaces
  const normalizedText = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  // Language detection patterns with more specific rules
  const patterns = {
    en: {
      pattern: /^[a-zA-Z\s.,!?'"-]+$/,
      threshold: 0.7,
      test: (text: string) => {
        // Common English words
        const englishWords = /\b(the|is|are|was|were|have|has|had|will|would|can|could|should|may|might|must|be|been|being|do|does|did|i|you|he|she|it|we|they)\b/i
        const words = text.toLowerCase().split(/\s+/)
        const englishWordCount = words.filter(word => englishWords.test(word)).length
        return englishWordCount / words.length >= 0.3 // At least 30% common English words
      }
    },
    es: {
      pattern: /[áéíóúñ¿¡]/i,
      threshold: 0.3,
      test: (text: string) => {
        const spanishWords = /\b(el|la|los|las|un|una|unos|unas|y|o|pero|porque|que|cuando|donde|como)\b/i
        return spanishWords.test(text.toLowerCase())
      }
    },
    fr: {
      pattern: /[àâçéèêëîïôûùüÿœæ]/i,
      threshold: 0.3,
      test: (text: string) => {
        const frenchWords = /\b(le|la|les|un|une|des|et|ou|mais|donc|car|je|tu|il|elle|nous|vous|ils|elles)\b/i
        return frenchWords.test(text.toLowerCase())
      }
    },
    de: {
      pattern: /[äöüß]/i,
      threshold: 0.3,
      test: (text: string) => {
        const germanWords = /\b(der|die|das|ein|eine|und|oder|aber|wenn|weil|ich|du|er|sie|es|wir|ihr|sie)\b/i
        return germanWords.test(text.toLowerCase())
      }
    },
    hi: {
      pattern: /[\u0900-\u097F]/,
      threshold: 0.5,
      test: (text: string) => text.match(/[\u0900-\u097F]/g)?.length || 0 > text.length * 0.5
    },
    ja: {
      pattern: /[\u3040-\u30FF\u4E00-\u9FAF]/,
      threshold: 0.5,
      test: (text: string) => text.match(/[\u3040-\u30FF\u4E00-\u9FAF]/g)?.length || 0 > text.length * 0.5
    },
    ko: {
      pattern: /[\uAC00-\uD7AF\u1100-\u11FF]/,
      threshold: 0.5,
      test: (text: string) => text.match(/[\uAC00-\uD7AF\u1100-\u11FF]/g)?.length || 0 > text.length * 0.5
    },
    zh: {
      pattern: /[\u4E00-\u9FFF]/,
      threshold: 0.5,
      test: (text: string) => text.match(/[\u4E00-\u9FFF]/g)?.length || 0 > text.length * 0.5
    },
    ru: {
      pattern: /[\u0400-\u04FF]/,
      threshold: 0.5,
      test: (text: string) => text.match(/[\u0400-\u04FF]/g)?.length || 0 > text.length * 0.5
    }
  }

  // First try to detect using specific language tests
  for (const [lang, config] of Object.entries(patterns)) {
    if (config.test(normalizedText)) {
      return lang
    }
  }

  // If no specific test passed, try pattern matching with thresholds
  for (const [lang, config] of Object.entries(patterns)) {
    const matches = normalizedText.match(config.pattern)?.length || 0
    if (matches > normalizedText.length * config.threshold) {
      return lang
    }
  }

  // Default to English if no clear match
  return 'en'
}

// Validate the detected language
export function validateLanguage(text: string, detectedLanguage: string): string {
  // Add Urdu script pattern
  const patterns = {
    ur: /[\u0600-\u06FF\u0750-\u077F]/,  // Urdu/Arabic script
    hi: /[\u0900-\u097F]/,               // Devanagari
    ja: /[\u3040-\u30FF\u4E00-\u9FAF]/,  // Japanese
    en: /^[a-zA-Z\s.,!?'"-]+$/          // English
  }

  // First check the text against script patterns
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang
    }
  }

  // If no script pattern matches, normalize and check the detected language
  const normalizedLang = detectedLanguage.toLowerCase().trim()
  const languageMap: Record<string, string> = {
    'english': 'en',
    'urdu': 'ur',
    'hindi': 'hi',
    'japanese': 'ja'
  }

  return languageMap[normalizedLang] || 'en'
}

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  hi: 'Hindi',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  ru: 'Russian'
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES 