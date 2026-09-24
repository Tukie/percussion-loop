import * as Tone from 'tone'
import { ref, watch } from 'vue'
import { createSamplerBank } from '@/services/sampler.service'

export function createPlaybackController(instrumentList) {
  const instruments = ref(instrumentList)
  const numSteps = 32
  const sequence = ref(instruments.value.map(() => Array(numSteps).fill(false)))
  const bpm = ref(120)
  const currentStep = ref(-1)
  const currentSequence = ref(null)
  const sequenceQueue = ref([])
  const waitingForHalfBar = ref(false)

  let samplers = {}
  let samplerBank = null
  let sequencerLoop = null
  let queueTimer = null
  let halfBarTimer = null
  let halfBarTimeout = null
  let disposed = false
  let startRequest = 0

  const initialize = () => {
    samplerBank = createSamplerBank(instruments.value)
    samplers = samplerBank.samplers

    Tone.loaded().then(() => {
      if (disposed) return
      Tone.getTransport().bpm.value = bpm.value
      sequencerLoop = new Tone.Sequence(
        (time, stepIndex) => {
          currentStep.value = stepIndex
          instruments.value.forEach((instrument, index) => {
            if (sequence.value[index][stepIndex]) {
              samplers[instrument.note].triggerAttackRelease(instrument.note, '32n', time)
            }
          })
        },
        Array.from({ length: numSteps }, (_, index) => index),
        '32n',
      )
      sequencerLoop.start(0)
    })
  }

  const startSequencer = async () => {
    const request = ++startRequest
    if (Tone.getContext().state !== 'running') {
      await Tone.start()
    }
    if (disposed || request !== startRequest) return
    Tone.getTransport().start()
  }

  const stopSequencer = () => {
    startRequest++
    Tone.getTransport().stop()
    currentStep.value = -1
    currentSequence.value = null
    sequenceQueue.value = []
    waitingForHalfBar.value = false
    clearInterval(queueTimer)
    clearInterval(halfBarTimer)
    clearTimeout(halfBarTimeout)
  }

  const setBpm = (value) => {
    const parsedBpm = parseInt(value)
    if (isNaN(parsedBpm) || parsedBpm < 20 || parsedBpm > 200) return
    bpm.value = parsedBpm
    Tone.getTransport().bpm.value = parsedBpm
  }

  watch(bpm, setBpm)

  const toggleStep = (instrumentIndex, stepIndex) => {
    const row = sequence.value[instrumentIndex]
    if (row) row[stepIndex] = !row[stepIndex]
  }

  const changeVolume = (note, value) => {
    const instrument = instruments.value.find((item) => item.note === note)
    if (!instrument || !samplers[note]) return
    samplers[note].volume.value = value
    instrument.volume = value
  }

  const playSelectedSound = (note) => {
    samplers[note]?.triggerAttackRelease(note, '8n')
  }

  const playHalfBar = () => {
    clearInterval(halfBarTimer)
    if (Tone.getTransport().state !== 'started') return

    waitingForHalfBar.value = true
    halfBarTimer = setInterval(() => {
      if (currentStep.value !== 31) return
      clearInterval(halfBarTimer)
      halfBarTimeout = setTimeout(() => {
        Tone.getTransport().position = '0:2:0'
        waitingForHalfBar.value = false
      }, 22)
    }, 20)
  }

  const queueSequence = (savedSequence, onSelected) => {
    if (sequenceQueue.value.includes(savedSequence.id)) return
    clearInterval(queueTimer)
    sequenceQueue.value = [savedSequence.id]
    currentSequence.value = null

    const selectSequence = () => {
      sequence.value = savedSequence.sequence
      currentSequence.value = savedSequence.id
      onSelected(savedSequence)
      sequenceQueue.value = []
    }

    if (Tone.getTransport().state !== 'started') {
      selectSequence()
      void startSequencer()
      return
    }

    queueTimer = setInterval(() => {
      if (currentStep.value < 29 || currentStep.value > 32) return
      clearInterval(queueTimer)
      selectSequence()
    }, 100)
  }

  const dispose = () => {
    disposed = true
    stopSequencer()
    sequencerLoop?.dispose()
    samplerBank?.dispose()
  }

  return {
    instruments,
    numSteps,
    sequence,
    bpm,
    currentStep,
    currentSequence,
    sequenceQueue,
    waitingForHalfBar,
    initialize,
    startSequencer,
    stopSequencer,
    setBpm,
    toggleStep,
    changeVolume,
    playSelectedSound,
    playHalfBar,
    queueSequence,
    dispose,
  }
}
