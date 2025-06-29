<script setup>
import { Button } from 'primevue';
import ConfirmButton from '@/components/ConfirmButton.vue';

const emit = defineEmits(['addToQueue', 'deleteSequence']);

const props = defineProps({
  sq: {
    type: Object,
    required: true
  },
  playing: {
    type: Boolean,
    default: false
  },
  inQueue: {
    type: Boolean,
    default: false
  }
});

</script>

<template>
  <div class="flex items-center w-ful rounded-md"
    :class="props.playing ? 'ring-8 ring-sky-400' : props.inQueue ? 'ring-8 ring-sky-200' : ''">
    <Button @click="emit('addToQueue', sq.id)" :disabled="props.playing" :label="sq.name" unstyled
      class="bg-white px-1 py-5 rounded-s-md text-black font-semibold w-full" />
    <ConfirmButton @confirm="emit('deleteSequence', sq.id)" message="ยืนยันการลบหรือไม่?" severity="danger">
      <Button label="ลบ" severity="danger" class="px-1 py-5 bg-red-500 rounded-e-md" unstyled />
    </ConfirmButton>
  </div>
</template>
