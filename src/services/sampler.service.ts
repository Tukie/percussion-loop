import * as Tone from 'tone'

interface ISampler {
  url: { key: string; value: string }
  release: number
  volume: number
  baseUrl: string
}

const makeSampler = (
  data: ISampler = {
    url: { key: '', value: '' },
    release: 1,
    volume: -20,
    baseUrl: '/',
  },
) => {
  return new Tone.Sampler({
    urls: {
      [data.url.key]: data.url.value,
    },
    release: 1,
    volume: data.volume,
    baseUrl: '/',
  })
}

const loadSamplers = (instruments = []) => {
  let samplers = {}
  for (const instrument of instruments) {
    const sampler = makeSampler({
      url: {
        key: instrument.note,
        value: instrument.url,
      },
      volume: instrument.volume,
      release: instrument.release,
      baseUrl: instrument.baseUrl,
    })

    const pitchShift = new Tone.PitchShift({
      pitch: instrument?.pitch || 0,
      windowSize: 0.03,
      feedback: 0,
    })

    pitchShift.toDestination()
    sampler.connect(pitchShift)
    samplers[instrument.note] = sampler
  }

  return samplers
}

export { loadSamplers }
