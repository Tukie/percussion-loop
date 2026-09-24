import * as Tone from 'tone'

interface InstrumentSample {
  note: string
  url: string
  volume: number
  pitch?: number
}

export function createSamplerBank(instruments: InstrumentSample[]) {
  const samplers: Record<string, Tone.Sampler> = {}
  const effects: Tone.PitchShift[] = []

  for (const instrument of instruments) {
    const sampler = new Tone.Sampler({
      urls: { [instrument.note]: instrument.url },
      release: 1,
      volume: instrument.volume,
      baseUrl: '/',
    })
    // A zero-pitch effect still processes audio; connect those samples directly.
    if (instrument.pitch) {
      const pitchShift = new Tone.PitchShift({
        pitch: instrument.pitch,
        windowSize: 0.03,
        feedback: 0,
      })
      pitchShift.toDestination()
      sampler.connect(pitchShift)
      effects.push(pitchShift)
    } else {
      sampler.toDestination()
    }

    samplers[instrument.note] = sampler
  }

  return {
    samplers,
    dispose() {
      Object.values(samplers).forEach((sampler) => sampler.dispose())
      effects.forEach((effect) => effect.dispose())
    },
  }
}
