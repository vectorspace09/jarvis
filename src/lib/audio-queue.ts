import { logger } from '@/store/logger-store'

type QueueState = {
  isPlaying: boolean
  progress: number
}

type Subscriber = (state: QueueState) => void

class AudioQueue {
  private queue: Array<{ url: string, text: string }> = []
  private isPlaying: boolean = false
  private currentAudio: HTMLAudioElement | null = null
  private subscribers: Set<Subscriber> = new Set()

  async add(text: string, audioBlob: Blob) {
    const url = URL.createObjectURL(audioBlob)
    this.queue.push({ url, text })
    logger.info('Added to audio queue:', { text })
    
    if (!this.isPlaying) {
      this.playNext()
    }
  }

  subscribe(callback: Subscriber) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notify() {
    const state: QueueState = {
      isPlaying: this.isPlaying,
      progress: this.currentAudio?.currentTime 
        ? (this.currentAudio.currentTime / this.currentAudio.duration) * 100
        : 0
    }
    this.subscribers.forEach(cb => cb(state))
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false
      return
    }

    this.isPlaying = true
    const { url, text } = this.queue.shift()!

    try {
      this.currentAudio = new Audio(url)
      
      this.currentAudio.ontimeupdate = () => this.notify()
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(url)
        this.notify()
        this.playNext()
      }

      this.currentAudio.onerror = (error) => {
        logger.error('Audio playback error:', error)
        URL.revokeObjectURL(url)
        this.playNext()
      }

      logger.info('Playing audio:', { text })
      await this.currentAudio.play()
    } catch (error) {
      logger.error('Failed to play audio:', error)
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
    this.isPlaying = false
  }
}

export const audioQueue = new AudioQueue() 