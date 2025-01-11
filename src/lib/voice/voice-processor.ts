import { logger } from '@/store/logger-store'
import { validateLanguage } from '@/lib/language-utils'

interface TranscriptionResult {
  text: string
  detectedLanguage: string
  confidence: number
}

export class VoiceProcessor {
  private static instance: VoiceProcessor
  private processingQueue: Array<{
    blob: Blob,
    resolve: (result: TranscriptionResult) => void,
    reject: (error: any) => void
  }> = []
  private isProcessing = false

  static getInstance() {
    if (!VoiceProcessor.instance) {
      VoiceProcessor.instance = new VoiceProcessor()
    }
    return VoiceProcessor.instance
  }

  async processAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    return new Promise((resolve, reject) => {
      this.processingQueue.push({ blob: audioBlob, resolve, reject })
      this.processNext()
    })
  }

  private async processNext() {
    if (this.isProcessing || this.processingQueue.length === 0) return

    this.isProcessing = true
    const { blob, resolve, reject } = this.processingQueue.shift()!

    try {
      const formData = new FormData()
      formData.append('audio', blob)

      logger.info('Processing audio chunk', { size: blob.size })

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const rawResult = await response.json()
      
      // Validate and correct language detection
      const validatedLanguage = validateLanguage(rawResult.text, rawResult.detectedLanguage)
      
      const result: TranscriptionResult = {
        text: rawResult.text,
        detectedLanguage: validatedLanguage,
        confidence: rawResult.confidence ?? 1.0 // Default to 1.0 if not provided
      }

      resolve(result)
    } catch (error) {
      logger.error('Audio processing error:', error)
      reject(error)
    } finally {
      this.isProcessing = false
      this.processNext()
    }
  }
}

export type { TranscriptionResult } 