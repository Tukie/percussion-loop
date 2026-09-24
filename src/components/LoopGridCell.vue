<script setup>
import { computed } from 'vue'
import LoopItem from '@/components/LoopItem.vue'

const props = defineProps({
  position: { type: Number, required: true },
  sequence: { type: Object, default: null },
  playing: { type: Boolean, default: false },
  inQueue: { type: Boolean, default: false },
  ordering: { type: Boolean, default: false },
  selectedLoopId: { type: String, default: null },
})

const emit = defineEmits(['selectLoop', 'placeSequence', 'addToQueue', 'deleteSequence'])

const checkboxLabel = computed(() => {
  if (!props.sequence) return ''
  if (props.selectedLoopId === props.sequence.id) return `ยกเลิกการเลือก ${props.sequence.name}`
  if (props.selectedLoopId) return `วาง loop ที่ช่อง ${props.position + 1}`
  return `เลือกย้าย ${props.sequence.name}`
})

const handleSlotClick = () => {
  if (props.selectedLoopId) emit('placeSequence', props.position)
  else if (props.sequence) emit('selectLoop', props.sequence.id)
}
</script>

<template>
  <div
    class="min-h-16 min-w-0 rounded-lg transition-colors"
    :class="[
      sequence ? '' : 'border border-dashed border-gray-600 bg-gray-900/40',
      ordering && selectedLoopId === sequence?.id ? 'ring-4 ring-teal-400' : '',
    ]"
  >
    <div v-if="ordering && sequence" class="flex h-full min-h-16 overflow-hidden rounded-lg">
      <label
        class="flex shrink-0 items-center bg-gray-700 px-3"
        :title="checkboxLabel"
      >
        <input
          :key="sequence.id"
          type="checkbox"
          class="size-5 cursor-pointer accent-teal-500"
          :checked="selectedLoopId === sequence.id"
          :aria-label="checkboxLabel"
          @change="handleSlotClick"
        />
      </label>
      <button
        type="button"
        class="min-w-0 flex-1 px-2 font-semibold text-black"
        :style="{ backgroundColor: sequence.color }"
        @click="handleSlotClick"
      >
        {{ sequence.name }}
      </button>
    </div>
    <button
      v-else-if="ordering"
      type="button"
      class="flex h-full min-h-16 w-full items-center justify-center text-xs text-gray-500 enabled:hover:bg-teal-900/30 enabled:hover:text-teal-300"
      :disabled="!selectedLoopId"
      :aria-label="`วาง loop ที่ช่อง ${position + 1}`"
      @click="handleSlotClick"
    >
      ช่อง {{ position + 1 }}
    </button>
    <LoopItem
      v-else-if="sequence"
      :sq="sequence"
      :playing
      :inQueue
      @addToQueue="emit('addToQueue', $event)"
      @deleteSequence="emit('deleteSequence', $event)"
    />
  </div>
</template>
