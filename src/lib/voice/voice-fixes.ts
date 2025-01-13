export const audioUtils = {
  validateAudioSupport() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Audio input not supported');
    }
    const AudioContextClass = window.AudioContext || 
      ((window as any).webkitAudioContext as typeof AudioContext);
    if (!AudioContextClass) {
      throw new Error('AudioContext not supported');
    }
  },

  async validateAudioFormat(blob: Blob): Promise<boolean> {
    const validTypes = ['audio/webm', 'audio/wav', 'audio/ogg'];
    return validTypes.includes(blob.type) && blob.size > 0;
  }
}; 