export type Unsubscribe = () => void

export interface AudioQueueState {
  isPlaying: boolean
  progress: number
}

export interface AudioQueue {
  subscribe: (callback: (state: AudioQueueState) => void) => Unsubscribe
} 