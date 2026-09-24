<script setup>
import { computed, useTemplateRef } from 'vue'
import { makeDraggable } from '@vue-dnd-kit/core'
import LoopItem from '@/components/LoopItem.vue'

const props = defineProps({
  sq: { type: Object, required: true },
  category: { type: String, required: true },
  playing: { type: Boolean, default: false },
  inQueue: { type: Boolean, default: false },
})

const emit = defineEmits(['addToQueue', 'deleteSequence'])
const loopRef = useTemplateRef('loop')
const { isDragging } = makeDraggable(loopRef, {
  id: props.sq.id,
  groups: computed(() => [props.category]),
  dragHandle: '.loop-drag-handle',
  activation: { distance: 5 },
  data: () => ({ id: props.sq.id, category: props.category }),
})
</script>

<template>
  <div ref="loop" class="flex h-full min-w-0 items-stretch" :class="{ 'opacity-40': isDragging }">
    <button
      type="button"
      class="loop-drag-handle shrink-0 touch-none select-none cursor-grab rounded-l-md border border-gray-600 bg-gray-700 px-2 text-gray-200 hover:bg-gray-600 active:cursor-grabbing"
      :aria-label="`ลากย้าย ${sq.name}`"
      :title="`ลากย้าย ${sq.name}`"
    >
      ⠿
    </button>
    <LoopItem
      class="min-w-0 flex-1"
      :sq
      :playing
      :inQueue
      @addToQueue="emit('addToQueue', $event)"
      @deleteSequence="emit('deleteSequence', $event)"
    />
  </div>
</template>
