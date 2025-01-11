import { EventEmitter } from 'events'
import type { AudioQueueState, Unsubscribe } from '@/types/audio'
import { logger } from '@/store/logger-store'

class AudioQueue extends EventEmitter {
  private state: AudioQueueState = {
    isPlaying: false,
    progress: 0
  }
  private currentAudio: HTMLAudioElement | null = null
  private queue: Array<{ url: string, text: string }> = []

  subscribe(callback: (state: AudioQueueState) => void): Unsubscribe {
    const handler = () => callback(this.state)
    this.on('stateChange', handler)
    handler() // Initial state
    return () => this.off('stateChange', handler)
  }

  private setState(updates: Partial<AudioQueueState>) {
    this.state = { ...this.state, ...updates }
    this.emit('stateChange', this.state)
  }

  private async playWithRetry(audio: HTMLAudioElement, retries = 2): Promise<void> {
    try {
      await audio.play()
    } catch (error: unknown) {
      if (retries > 0 && error instanceof Error && error.name === 'NotAllowedError') {
        // Wait and retry for user interaction errors
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.playWithRetry(audio, retries - 1)
      }
      throw error
    }
  }

  async enqueue(text: string, audioUrl: string) {
    this.queue.push({ url: audioUrl, text })
    logger.info('Audio queued', { text })
    
    if (!this.state.isPlaying) {
      this.playNext()
    }
  }

  private async playNext() {
    if (this.state.isPlaying || this.queue.length === 0) return

    const { url, text } = this.queue.shift()!
    this.currentAudio = new Audio(url)

    try {
      this.currentAudio.addEventListener('play', () => {
        this.setState({ isPlaying: true, progress: 0 })
        logger.info('Audio playback started', { text })
      })

      this.currentAudio.addEventListener('ended', () => {
        this.setState({ isPlaying: false, progress: 100 })
        URL.revokeObjectURL(url)
        this.currentAudio = null
        this.playNext()
      })

      await this.playWithRetry(this.currentAudio)
    } catch (error) {
      logger.error('Audio playback error:', error)
      this.setState({ isPlaying: false, progress: 0 })
      this.currentAudio = null
      this.playNext()
    }
  }

  clear() {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
    this.queue.forEach(({ url }) => URL.revokeObjectURL(url))
    this.queue = []
    this.setState({ isPlaying: false, progress: 0 })
  }
}

export const audioQueue = new AudioQueue() 