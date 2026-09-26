<script setup>
import Slider from 'primevue/slider'

const props = defineProps({
  instrument: { type: Object, required: true },
  index: { type: Number, required: true },
})

const emit = defineEmits(['changeVolume'])
const resetVolume = () => emit('changeVolume', props.instrument.note, -20)
</script>

<template>
  <section
    :aria-label="`Channel ${index + 1}: ${instrument.label}`"
    class="flex w-32 shrink-0 flex-col items-center rounded-xl border border-gray-700 bg-gray-800 p-3 shadow-inner"
  >
    <div class="mb-3 h-1 w-full rounded-full" :class="instrument.color"></div>
    <span class="text-[10px] font-semibold tracking-[0.2em] text-gray-400">CH {{ index + 1 }}</span>
    <h3
      class="mt-1 h-10 w-full overflow-hidden text-center text-sm font-semibold text-white"
      :title="instrument.label"
    >
      {{ instrument.label }}
    </h3>

    <output class="mb-4 rounded-md bg-gray-950 px-3 py-1 font-mono text-sm text-teal-300">
      {{ Number(instrument.volume) }} <span class="text-xs text-gray-400">dB</span>
    </output>

    <div class="flex h-56 items-center gap-4">
      <div
        class="flex h-52 flex-col justify-between font-mono text-[10px] text-gray-400"
        aria-hidden="true"
      >
        <span>-10</span>
        <span>-20</span>
        <span>-30</span>
        <span>-40</span>
        <span>-50</span>
      </div>
      <Slider
        :model-value="Number(instrument.volume)"
        orientation="vertical"
        :min="-50"
        :max="-10"
        :step="1"
        class="h-52!"
        :aria-label="`ระดับเสียง ${instrument.label}`"
        :pt="{
          handle: {
            class: 'h-5! w-9! rounded-sm! bg-white! border-2! border-gray-300! shadow-md!',
          },
        }"
        @update:model-value="emit('changeVolume', instrument.note, $event)"
        @dblclick="resetVolume"
      />
    </div>

    <button
      type="button"
      class="mt-4 rounded-md border border-gray-600 px-3 py-1 text-xs font-medium text-gray-300 hover:border-teal-400 hover:text-white"
      :aria-label="`รีเซ็ตระดับเสียง ${instrument.label}`"
      @click="resetVolume"
    >
      Reset
    </button>
  </section>
</template>
