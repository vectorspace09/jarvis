import { supabase } from '@/lib/supabase'
import { logger } from '@/store/logger-store'

interface SpeechMetricsData {
  session_id: string;
  total_attempts: number;
  valid_speech: number;
  invalid_speech: number;
  transcription_errors: number;
  average_confidence: number;
  success_rate: number;
  invalid_phrases?: string[];
  metadata?: Record<string, any>;
  timestamp?: string;
}

export class MetricsService {
  private static instance: MetricsService;
  private currentSessionId: string;
  private batchedMetrics: SpeechMetricsData[] = [];
  private readonly BATCH_SIZE = 10;

  private constructor() {
    this.currentSessionId = crypto.randomUUID();
    // Flush metrics periodically
    setInterval(() => this.flushMetrics(), 5 * 60 * 1000);
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new MetricsService();
    }
    return this.instance;
  }

  async storeMetrics(data: Partial<SpeechMetricsData>) {
    try {
      const metrics: SpeechMetricsData = {
        session_id: this.currentSessionId,
        total_attempts: data.total_attempts || 0,
        valid_speech: data.valid_speech || 0,
        invalid_speech: data.invalid_speech || 0,
        transcription_errors: data.transcription_errors || 0,
        average_confidence: data.average_confidence || 0,
        success_rate: data.success_rate || 0,
        invalid_phrases: data.invalid_phrases,
        metadata: data.metadata,
        timestamp: new Date().toISOString()
      };

      this.batchedMetrics.push(metrics);

      if (this.batchedMetrics.length >= this.BATCH_SIZE) {
        await this.flushMetrics();
      }
    } catch (error) {
      logger.error('Failed to store metrics:', error);
    }
  }

  private async flushMetrics() {
    if (this.batchedMetrics.length === 0) return;

    try {
      const { error } = await supabase
        .from('speech_metrics')
        .insert(this.batchedMetrics);

      if (error) throw error;

      this.batchedMetrics = [];
      logger.info('Metrics flushed successfully', { count: this.batchedMetrics.length });
    } catch (error) {
      logger.error('Failed to flush metrics:', error);
    }
  }

  async getMetricsReport(days: number = 7) {
    try {
      const { data, error } = await supabase
        .from('speech_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return this.analyzeMetrics(data as SpeechMetricsData[]);
    } catch (error) {
      logger.error('Failed to get metrics report:', error);
      return null;
    }
  }

  private analyzeMetrics(data: SpeechMetricsData[]) {
    const analysis = {
      totalSessions: new Set(data.map(d => d.session_id)).size,
      averageSuccessRate: data.reduce((acc, d) => acc + d.success_rate, 0) / data.length,
      commonIssues: this.findCommonIssues(data),
      trends: this.calculateTrends(data)
    };

    return analysis;
  }

  private findCommonIssues(data: SpeechMetricsData[]) {
    const issues = data
      .flatMap(d => d.invalid_phrases || [])
      .reduce((acc: Record<string, number>, phrase: string) => {
        acc[phrase] = (acc[phrase] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(issues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, count }));
  }

  private calculateTrends(data: SpeechMetricsData[]) {
    type DailyStats = { total: number; success: number };
    
    const dailyRates = data.reduce((acc: Record<string, DailyStats>, d) => {
      const date = new Date(d.timestamp!).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { total: 0, success: 0 };
      }
      acc[date].total++;
      acc[date].success += d.success_rate;
      return acc;
    }, {});

    return Object.entries(dailyRates).map(([date, stats]) => ({
      date,
      successRate: stats.success / stats.total
    }));
  }
} 