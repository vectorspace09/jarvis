import { MetricsService } from './metrics-service'
import { logger } from '@/store/logger-store'

export class SpeechMetrics {
  private static instance: SpeechMetrics;
  private metricsService: MetricsService;
  private invalidPhrases: string[] = [];
  private metrics = {
    totalAttempts: 0,
    validSpeech: 0,
    invalidSpeech: 0,
    transcriptionErrors: 0,
    averageConfidence: [] as number[]
  };

  private constructor() {
    this.metricsService = MetricsService.getInstance();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SpeechMetrics();
    }
    return this.instance;
  }

  trackAttempt(validation: { isValid: boolean; confidence: number }) {
    this.metrics.totalAttempts++;
    if (validation.isValid) {
      this.metrics.validSpeech++;
    } else {
      this.metrics.invalidSpeech++;
    }
    this.metrics.averageConfidence.push(validation.confidence);
  }

  trackInvalidPhrase(phrase: string) {
    this.invalidPhrases.push(phrase);
  }

  async getReport() {
    try {
      const avgConfidence = this.metrics.averageConfidence.length > 0
        ? this.metrics.averageConfidence.reduce((a, b) => a + b, 0) / this.metrics.averageConfidence.length
        : 0;

      const report = {
        total_attempts: this.metrics.totalAttempts,
        valid_speech: this.metrics.validSpeech,
        invalid_speech: this.metrics.invalidSpeech,
        transcription_errors: this.metrics.transcriptionErrors,
        average_confidence: avgConfidence,
        success_rate: this.metrics.validSpeech / this.metrics.totalAttempts,
        invalid_phrases: this.invalidPhrases,
        metadata: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV
        }
      };

      // Store metrics
      await this.metricsService.storeMetrics(report);

      // Reset counters after successful storage
      this.resetMetrics();

      return report;
    } catch (error) {
      logger.error('Failed to generate metrics report:', error);
      return null;
    }
  }

  private resetMetrics() {
    this.metrics = {
      totalAttempts: 0,
      validSpeech: 0,
      invalidSpeech: 0,
      transcriptionErrors: 0,
      averageConfidence: []
    };
    this.invalidPhrases = [];
  }
} 