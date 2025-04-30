class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {}
  private isMuted: boolean = false
  private soundsLoaded: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSounds()
    }
  }

  private async initializeSounds() {
    const soundFiles = {
      tick: '/sounds/tick.mp3',
      keystroke: '/sounds/keystroke.mp3',
      button: '/sounds/button-click.mp3',
      hint: '/sounds/hint.mp3',
      error: '/sounds/error.mp3',
      success: '/sounds/success.mp3',
      incoming: '/sounds/incoming.mp3',
    }

    try {
      // Create and load all sounds
      for (const [name, path] of Object.entries(soundFiles)) {
        const audio = new Audio(path)
        
        // Add load error handling
        audio.onerror = (e) => {
          console.error(`Error loading sound ${name} from ${path}:`, e)
        }

        // Wait for the audio to be loaded
        await new Promise((resolve, reject) => {
          audio.oncanplaythrough = resolve
          audio.onerror = reject
          // Set a timeout in case loading takes too long
          setTimeout(reject, 5000)
        })

        this.sounds[name] = audio
      }

      // Configure volumes after all sounds are loaded
      Object.values(this.sounds).forEach(sound => {
        sound.volume = 0.3 // Set default volume to 30%
      })

      // Set specific volumes
      if (this.sounds.tick) this.sounds.tick.volume = 0.05 // Reduced from 0.1 to 0.05
      if (this.sounds.keystroke) this.sounds.keystroke.volume = 0.15
      if (this.sounds.incoming) this.sounds.incoming.volume = 0.1 // Set incoming sound volume

      this.soundsLoaded = true
      console.log('All sounds loaded successfully')
    } catch (error) {
      console.error('Error initializing sounds:', error)
      this.soundsLoaded = false
    }
  }

  play(soundName: keyof typeof this.sounds) {
    if (this.isMuted || typeof window === 'undefined' || !this.soundsLoaded) return

    const sound = this.sounds[soundName]
    if (sound) {
      try {
        // For rapid sounds like keystrokes, ticks, and incoming, create a new instance
        if (soundName === 'keystroke' || soundName === 'tick' || soundName === 'incoming') {
          const clone = sound.cloneNode() as HTMLAudioElement
          clone.volume = sound.volume // Ensure cloned sounds maintain the correct volume
          clone.play().catch(error => {
            console.error(`Error playing cloned sound ${soundName}:`, error)
          })
          // Clean up clone after playing
          clone.addEventListener('ended', () => clone.remove())
        } else {
          // For other sounds, just replay the original
          sound.currentTime = 0
          sound.play().catch(error => {
            console.error(`Error playing sound ${soundName}:`, error)
          })
        }
      } catch (error) {
        console.error(`Error playing sound ${soundName}:`, error)
      }
    } else {
      console.warn(`Sound ${soundName} not found`)
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  setMute(mute: boolean) {
    this.isMuted = mute
  }

  isReady() {
    return this.soundsLoaded
  }
}

// Create a singleton instance
export const soundManager = typeof window !== 'undefined' ? new SoundManager() : null

// Export a safe play function
export const playSound = (sound: keyof SoundManager['sounds']) => {
  soundManager?.play(sound)
} 