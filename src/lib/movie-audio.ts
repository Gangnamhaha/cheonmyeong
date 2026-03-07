/**
 * Procedural ambient BGM using Web Audio API.
 * Creates a mystical, meditation-like ambient soundscape
 * with zero external dependencies or licensing concerns.
 */

type MoodType = 'mystical' | 'dramatic' | 'warm' | 'intense' | 'serene' | 'hopeful'

interface MoodConfig {
  baseFreq: number
  chordRatios: number[]
  filterFreq: number
  lfoRate: number
  gainLevel: number
}

const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  mystical: { baseFreq: 110, chordRatios: [1, 1.5, 2, 3], filterFreq: 800, lfoRate: 0.08, gainLevel: 0.12 },
  dramatic: { baseFreq: 130.81, chordRatios: [1, 1.26, 1.5, 2], filterFreq: 1200, lfoRate: 0.12, gainLevel: 0.15 },
  warm: { baseFreq: 146.83, chordRatios: [1, 1.25, 1.5, 2], filterFreq: 600, lfoRate: 0.06, gainLevel: 0.1 },
  intense: { baseFreq: 98, chordRatios: [1, 1.33, 1.5, 2, 2.67], filterFreq: 1600, lfoRate: 0.15, gainLevel: 0.16 },
  serene: { baseFreq: 174.61, chordRatios: [1, 1.5, 2, 3], filterFreq: 500, lfoRate: 0.04, gainLevel: 0.08 },
  hopeful: { baseFreq: 164.81, chordRatios: [1, 1.25, 1.5, 2, 2.5], filterFreq: 900, lfoRate: 0.07, gainLevel: 0.11 },
}

export class MovieAudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private oscillators: OscillatorNode[] = []
  private filter: BiquadFilterNode | null = null
  private lfo: OscillatorNode | null = null
  private lfoGain: GainNode | null = null
  private convolver: ConvolverNode | null = null
  private currentMood: MoodType = 'mystical'
  private _isMuted = false
  private _isPlaying = false

  get isMuted() { return this._isMuted }
  get isPlaying() { return this._isPlaying }

  /**
   * Initialize audio context. Must be called from user gesture.
   */
  async init(): Promise<void> {
    if (this.ctx) return

    this.ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

    // Master gain
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0
    this.masterGain.connect(this.ctx.destination)

    // Convolver (reverb) — generate impulse response
    this.convolver = this.ctx.createConvolver()
    this.convolver.buffer = this.createReverbIR(this.ctx, 3, 2)
    this.convolver.connect(this.masterGain)

    // Low-pass filter
    this.filter = this.ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = 800
    this.filter.Q.value = 0.7
    this.filter.connect(this.convolver)

    // LFO for filter modulation
    this.lfo = this.ctx.createOscillator()
    this.lfoGain = this.ctx.createGain()
    this.lfo.frequency.value = 0.08
    this.lfoGain.gain.value = 200
    this.lfo.connect(this.lfoGain)
    this.lfoGain.connect(this.filter.frequency)
    this.lfo.start()
  }

  /**
   * Create a simple reverb impulse response
   */
  private createReverbIR(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate
    const length = rate * duration
    const buffer = ctx.createBuffer(2, length, rate)

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
      }
    }
    return buffer
  }

  /**
   * Start playing ambient BGM with the given mood
   */
  play(mood: MoodType = 'mystical'): void {
    if (!this.ctx || !this.masterGain || !this.filter || !this.lfo || !this.lfoGain) return
    if (this._isPlaying) this.stopOscillators()

    this.currentMood = mood
    const config = MOOD_CONFIGS[mood]

    // Update filter and LFO
    this.filter.frequency.setTargetAtTime(config.filterFreq, this.ctx.currentTime, 0.5)
    this.lfo.frequency.setTargetAtTime(config.lfoRate, this.ctx.currentTime, 0.3)
    this.lfoGain.gain.setTargetAtTime(config.filterFreq * 0.25, this.ctx.currentTime, 0.3)

    // Create oscillators for chord
    this.oscillators = config.chordRatios.map((ratio, idx) => {
      const osc = this.ctx!.createOscillator()
      const oscGain = this.ctx!.createGain()

      osc.type = idx === 0 ? 'sine' : idx < 3 ? 'triangle' : 'sine'
      osc.frequency.value = config.baseFreq * ratio
      // Slight detune for warmth
      osc.detune.value = (Math.random() - 0.5) * 8

      oscGain.gain.value = config.gainLevel / config.chordRatios.length
      // Higher harmonics quieter
      if (idx > 1) oscGain.gain.value *= 0.5

      osc.connect(oscGain)
      oscGain.connect(this.filter!)
      osc.start()

      return osc
    })

    // Fade in master gain
    const targetGain = this._isMuted ? 0 : config.gainLevel
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime)
    this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 1.5)

    this._isPlaying = true
  }

  /**
   * Transition to a new mood (crossfade)
   */
  changeMood(mood: MoodType): void {
    if (!this._isPlaying || mood === this.currentMood) return
    // Brief fade out, then restart with new mood
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime
      this.masterGain.gain.setTargetAtTime(0, now, 0.8)
      setTimeout(() => this.play(mood), 1200)
    }
  }

  /**
   * Stop all oscillators
   */
  private stopOscillators(): void {
    this.oscillators.forEach(osc => {
      try { osc.stop() } catch { /* already stopped */ }
    })
    this.oscillators = []
  }

  /**
   * Fade out and stop
   */
  stop(): void {
    if (!this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setTargetAtTime(0, now, 0.8)

    setTimeout(() => {
      this.stopOscillators()
      this._isPlaying = false
    }, 2500)
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    this._isMuted = !this._isMuted
    if (this.masterGain && this.ctx) {
      const config = MOOD_CONFIGS[this.currentMood]
      const target = this._isMuted ? 0 : config.gainLevel
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.3)
    }
    return this._isMuted
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    this.stopOscillators()
    if (this.lfo) {
      try { this.lfo.stop() } catch { /* */ }
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => { /* */ })
    }
    this.ctx = null
    this.masterGain = null
    this.filter = null
    this.lfo = null
    this.lfoGain = null
    this.convolver = null
    this._isPlaying = false
  }
}
