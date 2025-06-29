<script setup>
import { Button } from 'primevue';

const emit = defineEmits(['setBpm']);
const props = defineProps({
  bpm: {
    type: Number,
    default: 120
  }
});
</script>

<template>
  <div class="flex flex-col xl:flex-row items-center justify-center gap-10 w-full">
    <div class="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
      <label for="bpm-input" class="block text-sm font-medium text-gray-400 mb-2">BPM</label>
      <input type="number" id="bpm-input" step="1" min="10" max="300"
        class="w-full max-w-[100px] bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center"
        :value="props.bpm" @change="emit('setBpm', $event.target.value)" />
      <div class="flex items-center gap-5 w-full">
        <Button @click="emit('setBpm', props.bpm - 1)" label="- 1" class="flex-shrink-0"></Button>
        <input type="range" id="bpm-slider" min="20" max="165" :value="props.bpm"
          @input="emit('setBpm', $event.target.value)"
          class="w-full bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center" />
        <Button @click="emit('setBpm', props.bpm + 1)" label="+ 1" class="flex-shrink-0"></Button>
      </div>
    </div>
    <div class="w-full flex overflow-x-auto sm:grid grid-cols-4 md:grid-cols-7 gap-4">
      <Button class="shrink-0" @click="emit('setBpm', 70)">70</Button>
      <Button class="shrink-0" @click="emit('setBpm', 80)">80</Button>
      <Button class="shrink-0" @click="emit('setBpm', 90)">90</Button>
      <Button class="shrink-0" @click="emit('setBpm', 100)">100</Button>
      <Button class="shrink-0" @click="emit('setBpm', 110)">110</Button>
      <Button class="shrink-0" @click="emit('setBpm', 120)">120</Button>
      <Button class="shrink-0" @click="emit('setBpm', 130)">130</Button>
      <Button class="shrink-0" @click="emit('setBpm', 140)">140</Button>
      <Button class="shrink-0" @click="emit('setBpm', 150)">150</Button>
      <Button class="shrink-0" @click="emit('setBpm', 160)">160</Button>
    </div>
  </div>
</template>
