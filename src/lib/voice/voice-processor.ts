import { logger } from '@/store/logger-store'
import { TranscriptionResult } from '@/types/voice'

export class VoiceProcessor {
  private static instance: VoiceProcessor
  
  private constructor() {}
  
  static getInstance(): VoiceProcessor {
    if (!VoiceProcessor.instance) {
      VoiceProcessor.instance = new VoiceProcessor()
    }
    return VoiceProcessor.instance
  }

  async processAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    try {
      logger.info('Starting audio processing...', { 
        size: audioBlob.size, 
        type: audioBlob.type 
      });

      const formData = new FormData()
      formData.append('audio', audioBlob)

      logger.info('Sending audio for transcription...');
      const transcriptionResponse = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!transcriptionResponse.ok) {
        const errorText = await transcriptionResponse.text();
        logger.error('Transcription failed:', { 
          status: transcriptionResponse.status,
          error: errorText 
        });
        throw new Error(`Transcription failed: ${errorText}`);
      }

      const result = await transcriptionResponse.json();
      logger.info('Transcription response:', result);

      if (!result.text?.trim()) {
        logger.warn('Empty transcription received');
        throw new Error('Empty transcription');
      }

      return {
        text: result.text,
        detectedLanguage: result.detectedLanguage || 'en',
        confidence: result.confidence || 0.9
      }
    } catch (error) {
      logger.error('Audio processing failed:', error);
      throw error;
    }
  }
} 