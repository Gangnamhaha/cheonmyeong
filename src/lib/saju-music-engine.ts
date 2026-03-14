import type { Movement, SajuMusicParams } from './saju-music'

interface ScheduledNode {
  stopAt: number
  stop: () => void
}

export interface SajuMusicCallbacks {
  onMovementChange?: (index: number, movement: Movement) => void
  onProgress?: (time: number, total: number) => void
  onComplete?: () => void
}

type OscType = OscillatorType

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function pickWaveform(mood: Movement['mood']): OscType {
  if (mood === 'intense') return 'sawtooth'
  if (mood === 'warm') return 'triangle'
  if (mood === 'serene') return 'sine'
  if (mood === 'dramatic') return 'triangle'
  if (mood === 'hopeful') return 'sine'
  return 'triangle'
}

function seededNoise(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

export class SajuMusicEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private reverb: ConvolverNode | null = null
  private delay: DelayNode | null = null
  private delayFeedback: GainNode | null = null
  private progressTimer: ReturnType<typeof setInterval> | null = null
  private scheduled: ScheduledNode[] = []

  private callbacks: SajuMusicCallbacks = {}
  private startTime = 0
  private totalDuration = 0
  private movementStartTimes: number[] = []
  private currentMovementIndex = -1
  private volume = 0.85
  private _isPlaying = false

  get isPlaying(): boolean {
    return this._isPlaying
  }

  async init(): Promise<void> {
    if (this.ctx) return

    this.ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

    this.master = this.ctx.createGain()
    this.master.gain.value = this.volume
    this.master.connect(this.ctx.destination)

    this.musicBus = this.ctx.createGain()
    this.musicBus.gain.value = 0.9

    this.reverb = this.ctx.createConvolver()
    this.reverb.buffer = this.createImpulseResponse(this.ctx, 2.8, 2.1)

    this.delay = this.ctx.createDelay(1.2)
    this.delay.delayTime.value = 0.27

    this.delayFeedback = this.ctx.createGain()
    this.delayFeedback.gain.value = 0.28

    const wet = this.ctx.createGain()
    wet.gain.value = 0.28
    const dry = this.ctx.createGain()
    dry.gain.value = 0.72

    this.musicBus.connect(dry)
    this.musicBus.connect(this.reverb)
    this.musicBus.connect(this.delay)

    this.reverb.connect(wet)
    this.delay.connect(this.delayFeedback)
    this.delayFeedback.connect(this.delay)
    this.delay.connect(wet)

    dry.connect(this.master)
    wet.connect(this.master)
  }

  async play(params: SajuMusicParams, callbacks?: SajuMusicCallbacks): Promise<void> {
    await this.init()
    if (!this.ctx || !this.musicBus || !this.master) return

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    this.stop()
    this.callbacks = callbacks ?? {}

    const now = this.ctx.currentTime + 0.05
    const crossfade = 2.4
    this.startTime = now
    this.currentMovementIndex = -1
    this.movementStartTimes = []
    this.totalDuration = params.movements.reduce((acc, movement) => acc + movement.duration, 0)
    this._isPlaying = true

    let cursor = now
    params.movements.forEach((movement, movementIndex) => {
      this.movementStartTimes.push(cursor)
      this.scheduleMovement(movement, movementIndex, cursor, cursor + movement.duration, crossfade)
      cursor += movement.duration
    })

    this.startProgressTicker(params.movements)
  }

  async pause(): Promise<void> {
    if (!this.ctx || !this._isPlaying) return
    if (this.ctx.state === 'running') {
      await this.ctx.suspend()
    }
  }

  async resume(): Promise<void> {
    if (!this.ctx || !this._isPlaying) return
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
  }

  async togglePause(): Promise<boolean> {
    if (!this.ctx || !this._isPlaying) return false
    if (this.ctx.state === 'running') {
      await this.pause()
      return false
    }
    await this.resume()
    return true
  }

  setVolume(value: number): void {
    this.volume = clamp(value, 0, 1)
    if (!this.ctx || !this.master) return
    this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.08)
  }

  stop(): void {
    if (!this.ctx) return

    this.scheduled.forEach((item) => {
      try {
        item.stop()
      } catch {
        // ignore already stopped nodes
      }
    })
    this.scheduled = []

    if (this.progressTimer) {
      clearInterval(this.progressTimer)
      this.progressTimer = null
    }

    this._isPlaying = false
    this.currentMovementIndex = -1
  }

  destroy(): void {
    this.stop()
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {
        // ignore close errors
      })
    }
    this.ctx = null
    this.master = null
    this.musicBus = null
    this.reverb = null
    this.delay = null
    this.delayFeedback = null
  }

  private startProgressTicker(movements: readonly Movement[]): void {
    if (!this.ctx) return

    this.progressTimer = setInterval(() => {
      if (!this.ctx) return

      const elapsed = Math.max(0, this.ctx.currentTime - this.startTime)
      this.callbacks.onProgress?.(Math.min(elapsed, this.totalDuration), this.totalDuration)

      let movementIndex = movements.length - 1
      for (let i = 0; i < this.movementStartTimes.length; i += 1) {
        const start = this.movementStartTimes[i] - this.startTime
        const nextStart = this.movementStartTimes[i + 1] ? this.movementStartTimes[i + 1] - this.startTime : this.totalDuration
        if (elapsed >= start && elapsed < nextStart) {
          movementIndex = i
          break
        }
      }

      if (movementIndex !== this.currentMovementIndex) {
        this.currentMovementIndex = movementIndex
        this.callbacks.onMovementChange?.(movementIndex, movements[movementIndex])
      }

      if (elapsed >= this.totalDuration) {
        if (this.progressTimer) {
          clearInterval(this.progressTimer)
          this.progressTimer = null
        }
        this._isPlaying = false
        this.callbacks.onComplete?.()
      }
    }, 120)
  }

  private scheduleMovement(
    movement: Movement,
    movementIndex: number,
    startAt: number,
    endAt: number,
    crossfade: number,
  ): void {
    if (!this.ctx || !this.musicBus) return

    const movementGain = this.ctx.createGain()
    movementGain.gain.setValueAtTime(0, startAt)

    const targetGain = clamp(0.08 + movement.intensity * 0.22, 0.08, 0.32)
    movementGain.gain.linearRampToValueAtTime(targetGain, startAt + Math.min(crossfade, movement.duration * 0.45))
    movementGain.gain.setValueAtTime(targetGain, Math.max(startAt + 0.2, endAt - crossfade))
    movementGain.gain.linearRampToValueAtTime(0, endAt)
    movementGain.connect(this.musicBus)

    this.schedulePad(movement, movementIndex, movementGain, startAt, endAt)
    this.scheduleMelody(movement, movementIndex, movementGain, startAt, endAt)
    this.schedulePercussion(movement, movementIndex, movementGain, startAt, endAt)

    this.scheduled.push({
      stopAt: endAt,
      stop: () => {
        movementGain.disconnect()
      },
    })
  }

  private schedulePad(
    movement: Movement,
    movementIndex: number,
    destination: AudioNode,
    startAt: number,
    endAt: number,
  ): void {
    if (!this.ctx) return

    const padGain = this.ctx.createGain()
    const colorFilter = this.ctx.createBiquadFilter()
    colorFilter.type = 'lowpass'
    colorFilter.frequency.value = movement.baseFreq * 8
    colorFilter.Q.value = movement.mood === 'intense' ? 0.9 : 0.5

    const textureLfo = this.ctx.createOscillator()
    const textureLfoGain = this.ctx.createGain()
    textureLfo.type = 'sine'
    textureLfo.frequency.value = 0.04 + movementIndex * 0.01
    textureLfoGain.gain.value = 90 + movement.intensity * 80
    textureLfo.connect(textureLfoGain)
    textureLfoGain.connect(colorFilter.frequency)

    padGain.gain.setValueAtTime(0.0001, startAt)
    padGain.gain.exponentialRampToValueAtTime(0.08 + movement.intensity * 0.08, startAt + 2)
    padGain.gain.exponentialRampToValueAtTime(0.0001, endAt)

    const rootOsc = this.ctx.createOscillator()
    rootOsc.type = pickWaveform(movement.mood)
    rootOsc.frequency.value = movement.baseFreq * 0.5
    rootOsc.detune.value = movementIndex * 3

    const fifthOsc = this.ctx.createOscillator()
    fifthOsc.type = 'sine'
    fifthOsc.frequency.value = movement.baseFreq * 0.75
    fifthOsc.detune.value = -5

    rootOsc.connect(padGain)
    fifthOsc.connect(padGain)
    padGain.connect(colorFilter)
    colorFilter.connect(destination)

    textureLfo.start(startAt)
    rootOsc.start(startAt)
    fifthOsc.start(startAt)

    textureLfo.stop(endAt)
    rootOsc.stop(endAt)
    fifthOsc.stop(endAt)

    this.scheduled.push(
      {
        stopAt: endAt,
        stop: () => {
          textureLfo.stop()
          rootOsc.stop()
          fifthOsc.stop()
          padGain.disconnect()
          colorFilter.disconnect()
          textureLfo.disconnect()
          textureLfoGain.disconnect()
        },
      },
    )
  }

  private scheduleMelody(
    movement: Movement,
    movementIndex: number,
    destination: AudioNode,
    startAt: number,
    endAt: number,
  ): void {
    if (!this.ctx) return

    const beat = 60 / movement.tempo
    const sparseFactor = movement.intensity < 0.45 ? 2 : 1
    const step = beat / 2
    const maxNotes = Math.max(1, Math.floor((movement.duration / step) / sparseFactor))

    for (let noteIndex = 0; noteIndex < maxNotes; noteIndex += 1) {
      const noteTime = startAt + noteIndex * step * sparseFactor
      if (noteTime >= endAt - 0.05) break

      const seed = (movementIndex + 1) * 1000 + noteIndex * 17
      const ratioIndex = Math.floor(seededNoise(seed) * movement.scale.length)
      const octaveShift = seededNoise(seed + 11) > 0.75 ? 2 : seededNoise(seed + 23) > 0.45 ? 1 : 0
      const ratio = movement.scale[ratioIndex] ?? 1
      const freq = movement.baseFreq * ratio * Math.pow(2, octaveShift)
      const noteLength = clamp(step * (0.7 + seededNoise(seed + 31) * 0.4), 0.12, 0.9)

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const filter = this.ctx.createBiquadFilter()

      osc.type = pickWaveform(movement.mood)
      osc.frequency.setValueAtTime(freq, noteTime)
      osc.detune.setValueAtTime((seededNoise(seed + 47) - 0.5) * 7, noteTime)

      filter.type = 'bandpass'
      filter.frequency.value = clamp(freq * 1.7, 200, 3200)
      filter.Q.value = movement.mood === 'mystical' ? 8 : 4

      const peak = clamp(0.04 + movement.intensity * 0.09, 0.03, 0.14)
      gain.gain.setValueAtTime(0.0001, noteTime)
      gain.gain.exponentialRampToValueAtTime(peak, noteTime + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + noteLength)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(destination)

      osc.start(noteTime)
      osc.stop(noteTime + noteLength + 0.05)

      this.scheduled.push({
        stopAt: noteTime + noteLength + 0.05,
        stop: () => {
          osc.stop()
          osc.disconnect()
          filter.disconnect()
          gain.disconnect()
        },
      })
    }
  }

  private schedulePercussion(
    movement: Movement,
    movementIndex: number,
    destination: AudioNode,
    startAt: number,
    endAt: number,
  ): void {
    if (!this.ctx) return

    const beat = 60 / movement.tempo
    const interval = movement.intensity < 0.45 ? beat * 2 : beat
    const noiseBuffer = this.createNoiseBuffer(this.ctx, 0.2)

    for (let hit = 0; ; hit += 1) {
      const hitTime = startAt + hit * interval
      if (hitTime >= endAt - 0.04) break

      const noise = this.ctx.createBufferSource()
      noise.buffer = noiseBuffer

      const hitFilter = this.ctx.createBiquadFilter()
      hitFilter.type = 'bandpass'
      hitFilter.frequency.value = clamp(250 + movementIndex * 80 + movement.intensity * 400, 200, 1200)
      hitFilter.Q.value = 1.2 + movement.intensity * 2

      const hitGain = this.ctx.createGain()
      const level = clamp(0.01 + movement.intensity * 0.04, 0.01, 0.06)
      hitGain.gain.setValueAtTime(0.0001, hitTime)
      hitGain.gain.exponentialRampToValueAtTime(level, hitTime + 0.005)
      hitGain.gain.exponentialRampToValueAtTime(0.0001, hitTime + 0.12)

      noise.connect(hitFilter)
      hitFilter.connect(hitGain)
      hitGain.connect(destination)

      noise.start(hitTime)
      noise.stop(hitTime + 0.14)

      this.scheduled.push({
        stopAt: hitTime + 0.14,
        stop: () => {
          noise.stop()
          noise.disconnect()
          hitFilter.disconnect()
          hitGain.disconnect()
        },
      })
    }
  }

  private createImpulseResponse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate)

    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < length; i += 1) {
        const n = (Math.random() * 2) - 1
        data[i] = n * Math.pow(1 - i / length, decay)
      }
    }

    return buffer
  }

  private createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const size = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < size; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / size)
    }

    return buffer
  }
}
