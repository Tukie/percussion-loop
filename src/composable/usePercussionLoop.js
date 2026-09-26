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
  const ordering = ref(false)
  const selectedLoopId = ref(null)
  const groupByCategory = computed(() => groupSequencesByCategory(savedSequences.value))
  const selectedCategory = ref(null)
  const activeCategory = computed({
    get: () =>
      groupByCategory.value.some((group) => group.name === selectedCategory.value)
        ? selectedCategory.value
        : (groupByCategory.value[0]?.name ?? null),
    set: (category) => {
      selectedCategory.value = category
      selectedLoopId.value = null
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
    selectedLoopId.value = null
    activeCategory.value = sequenceCategory.value
  }

  const deleteSequence = (id) => {
    storage.remove(id)
    if (selectedLoopId.value === id) selectedLoopId.value = null
    refreshSavedSequences()
  }

  const exportSequences = () => storage.exportBackup()

  const importSequences = (backup) => {
    const count = storage.importBackup(backup)
    playback.stopSequencer()
    selectedLoopId.value = null
    refreshSavedSequences()
    selectedCategory.value = null
    return count
  }

  const toggleOrdering = () => {
    ordering.value = !ordering.value
    selectedLoopId.value = null
  }

  const selectLoop = (id) => {
    if (!ordering.value) return
    const selected = storage.get(id)
    if (selected?.category !== activeCategory.value) return
    selectedLoopId.value = selectedLoopId.value === id ? null : id
  }

  const placeSequence = (position) => {
    if (!ordering.value || !selectedLoopId.value) return
    if (storage.move(selectedLoopId.value, position, activeCategory.value)) {
      savedSequences.value = storage.list()
      selectedLoopId.value = null
    }
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
    ordering,
    selectedLoopId,
    changeVolume: playback.changeVolume,
    toggleStep: playback.toggleStep,
    startSequencer: playback.startSequencer,
    stopSequencer: playback.stopSequencer,
    playHalfBar: playback.playHalfBar,
    saveSequence,
    deleteSequence,
    exportSequences,
    importSequences,
    toggleOrdering,
    selectLoop,
    placeSequence,
    playSelectedSound: playback.playSelectedSound,
    addToQueue,
  }
}
