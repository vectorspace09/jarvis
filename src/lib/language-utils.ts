export function detectLanguage(text: string): string {
  // Devanagari script (Hindi)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi'
  }
  
  // Urdu script (Arabic/Persian characters)
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ur'
  }

  // English (default)
  return 'en'
}

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  ur: 'Urdu'
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES 