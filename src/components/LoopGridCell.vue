<script setup>
import { computed, useTemplateRef } from 'vue'
import { makeDroppable } from '@vue-dnd-kit/core'
import DraggableLoop from '@/components/DraggableLoop.vue'

const props = defineProps({
  position: { type: Number, required: true },
  sequence: { type: Object, default: null },
  category: { type: String, required: true },
  playing: { type: Boolean, default: false },
  inQueue: { type: Boolean, default: false },
})

const emit = defineEmits(['moveSequence', 'addToQueue', 'deleteSequence'])
const cellRef = useTemplateRef('cell')
const { isDragOver } = makeDroppable(cellRef, {
  groups: computed(() => [props.category]),
  data: () => ({ category: props.category, position: props.position }),
  events: {
    onDrop(event) {
      const dragged = event.draggedItems[0]?.data
      if (dragged?.category === props.category) emit('moveSequence', dragged.id, props.position)
    },
  },
})
</script>

<template>
  <div
    ref="cell"
    class="min-h-16 min-w-0 rounded-lg transition-colors"
    :class="[
      sequence ? '' : 'border border-dashed border-gray-600 bg-gray-900/40',
      isDragOver ? 'ring-2 ring-teal-400 bg-teal-900/30' : '',
    ]"
  >
    <DraggableLoop
      v-if="sequence"
      :key="sequence.id"
      :sq="sequence"
      :category
      :playing
      :inQueue
      @addToQueue="emit('addToQueue', $event)"
      @deleteSequence="emit('deleteSequence', $event)"
    />
  </div>
</template>
