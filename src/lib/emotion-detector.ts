import { VoiceEmotion } from '@/types/voice'

interface EmotionScore {
  emotion: VoiceEmotion
  score: number
}

export function detectEmotion(text: string): VoiceEmotion {
  const emotions: EmotionScore[] = [
    { emotion: 'happy', score: countEmotionIndicators(text, happyIndicators) },
    { emotion: 'sad', score: countEmotionIndicators(text, sadIndicators) },
    { emotion: 'excited', score: countEmotionIndicators(text, excitedIndicators) },
    { emotion: 'calm', score: countEmotionIndicators(text, calmIndicators) },
    { emotion: 'neutral', score: 1 } // Default score for neutral
  ]

  return emotions.reduce((prev, current) => 
    current.score > prev.score ? current : prev
  ).emotion
}

const happyIndicators = [
  '😊', '😃', '😄', '🙂', 'happy', 'glad', 'joy', 'wonderful', 'great', 'excellent',
  'amazing', 'fantastic', 'delighted', 'pleased', 'thank', 'love', '!'
]

const sadIndicators = [
  '😢', '😭', '😔', '🙁', 'sad', 'sorry', 'unfortunate', 'regret', 'disappointed',
  'unhappy', 'miss', 'lost', 'difficult', 'hard', 'worry', 'worried'
]

const excitedIndicators = [
  '😲', '😮', '🤩', '😃', 'wow', 'awesome', 'incredible', 'unbelievable',
  'exciting', 'amazing', '!!!', 'omg', 'oh my god', 'cannot believe'
]

const calmIndicators = [
  '😌', '😊', '🙂', 'calm', 'peaceful', 'relaxed', 'gentle', 'quiet',
  'steady', 'balanced', 'composed', 'tranquil'
]

function countEmotionIndicators(text: string, indicators: string[]): number {
  const lowerText = text.toLowerCase()
  return indicators.reduce((count, indicator) => 
    count + (lowerText.split(indicator.toLowerCase()).length - 1), 0
  )
} 