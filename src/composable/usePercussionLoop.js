import { computed, onMounted, onUnmounted, ref } from 'vue'
import { createPlaybackController } from '@/controllers/playback.controller'
import { getGetInstrument } from '@/services/instrument.service'
import { keyMapping } from '@/services/keyMapping.service'
import { getDefaultSequence } from '@/services/sequences.service'
import { countLoopPages, getLoopPageSlots } from '@/services/loopLayout.service'
import { createSequenceStorage, groupSequencesByCategory } from '@/services/sequenceStorage.service'

export function usePercussionLoop() {
  const playback = createPlaybackController(getGetInstrument())
  const storage = createSequenceStorage(localStorage, getDefaultSequence())

  const sequenceName = ref('')
  const sequenceColor = ref('#ffffff')
  const sequenceCategory = ref('')
  const numpadKey = ref('')
  const savedSequences = ref([])
  const groupByCategory = computed(() => groupSequencesByCategory(savedSequences.value))
  const selectedCategory = ref(null)
  const activeCategory = computed({
    get: () =>
      groupByCategory.value.some((group) => group.name === selectedCategory.value)
        ? selectedCategory.value
        : (groupByCategory.value[0]?.name ?? null),
    set: (category) => {
      selectedCategory.value = category
    },
  })
  const activeGroup = computed(() =>
    groupByCategory.value.find((group) => group.name === activeCategory.value),
  )
  const pageCount = computed(() => countLoopPages(activeGroup.value?.sequences ?? []))
  const loopPages = computed(() =>
    Array.from({ length: pageCount.value }, (_, index) => ({
      number: index + 1,
      slots: getLoopPageSlots(activeGroup.value?.sequences ?? [], index),
    })),
  )

  let unbindKeys = () => {}

  const setSequenceDetails = (savedSequence) => {
    sequenceName.value = savedSequence.name
    sequenceColor.value = savedSequence.color
    sequenceCategory.value = savedSequence.category
    numpadKey.value = savedSequence.numpad
  }

  const addToQueue = (id) => {
    const savedSequence = storage.get(id)
    if (savedSequence) playback.queueSequence(savedSequence, setSequenceDetails)
  }

  const refreshSavedSequences = () => {
    savedSequences.value = storage.list()
    unbindKeys()

    const keys = [
      { key: 'Numpad0', function: playback.stopSequencer },
      { key: 'NumpadAdd', function: () => playback.setBpm(playback.bpm.value + 1) },
      { key: 'NumpadSubtract', function: () => playback.setBpm(playback.bpm.value - 1) },
      { key: 'NumpadDecimal', function: playback.playHalfBar },
    ]

    for (const savedSequence of savedSequences.value) {
      if (savedSequence.numpad && !keys.some((item) => item.key === savedSequence.numpad)) {
        keys.push({ key: savedSequence.numpad, function: () => addToQueue(savedSequence.id) })
      }
    }

    unbindKeys = keyMapping(keys)
  }

  const saveSequence = () => {
    storage.save({
      name: sequenceName.value,
      sequence: playback.sequence.value,
      bpm: playback.bpm.value,
      color: sequenceColor.value,
      category: sequenceCategory.value,
      numpad: numpadKey.value,
    })
    refreshSavedSequences()
    activeCategory.value = sequenceCategory.value
  }

  const deleteSequence = (id) => {
    storage.remove(id)
    refreshSavedSequences()
  }

  const moveSequence = (id, position) => {
    if (storage.move(id, position)) savedSequences.value = storage.list()
  }

  onMounted(() => {
    playback.initialize()
    storage.seedDefaults()
    storage.ensurePositions()
    refreshSavedSequences()
  })

  onUnmounted(() => {
    unbindKeys()
    playback.dispose()
  })

  return {
    bpm: playback.bpm,
    currentStep: playback.currentStep,
    currentSequence: playback.currentSequence,
    sequenceName,
    sequenceColor,
    sequenceCategory,
    numpadKey,
    instruments: playback.instruments,
    numSteps: playback.numSteps,
    sequence: playback.sequence,
    sequenceQueue: playback.sequenceQueue,
    waitingForHalfBar: playback.waitingForHalfBar,
    groupByCategory,
    activeCategory,
    activeGroup,
    pageCount,
    loopPages,
    changeVolume: playback.changeVolume,
    toggleStep: playback.toggleStep,
    startSequencer: playback.startSequencer,
    stopSequencer: playback.stopSequencer,
    playHalfBar: playback.playHalfBar,
    saveSequence,
    deleteSequence,
    moveSequence,
    playSelectedSound: playback.playSelectedSound,
    addToQueue,
  }
}
