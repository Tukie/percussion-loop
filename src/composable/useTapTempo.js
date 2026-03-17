import { ref, onUnmounted } from 'vue'

export function useTapTempo(timeoutDuration = 2000) {
  const bpm = ref(0)
  const times = ref([])
  const lastTime = ref(null)
  let timer = null

  const reset = () => {
    times.value = []
    lastTime.value = null
    bpm.value = 0
  }

  const tap = () => {
    const currentTime = performance.now()

    // Clear old tempo if user stopped tapping for too long
    if (timer) clearTimeout(timer)

    if (lastTime.value) {
      const difference = currentTime - lastTime.value
      times.value.push(difference)

      // Calculate BPM when we have enough data (at least 2 intervals)
      if (times.value.length >= 2) {
        const average = times.value.reduce((a, b) => a + b, 0) / times.value.length
        bpm.value = Number((60_000 / average).toFixed(1))
      }
    }

    lastTime.value = currentTime

    // Set auto-reset
    timer = setTimeout(reset, timeoutDuration)
  }

  // Cleanup when Component is destroyed
  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    bpm,
    tap,
    reset,
  }
}
