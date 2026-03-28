<script setup>
import { Button, Dialog, Slider } from 'primevue';
import { ref } from 'vue';
import TapTempo from './TapTempo.vue';
import { defaultTempoList } from '@/services/tempo.service';

const model = defineModel('bpm');
const openDialog = ref(false);

const handleSelectBPM = (bpm) => {
  model.value = bpm;
  openDialog.value = false;
};
</script>

<template>
  <div class="flex flex-col xl:flex-row items-center justify-center gap-10 w-full">
    <div class="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
      <label for="bpm-input" class="block text-sm font-medium text-gray-400 mb-2">BPM</label>
      <span class="text-4xl font-bold text-white">{{ model }}</span>
      <div class="flex items-center gap-5 w-full">
        <Button @click="model -= 1" label="-" class="shrink-0 px-12!"></Button>
        <Slider v-model="model" :min="50" :max="200" class="w-full" :pt="{ handle: { class: 'size-9! bg-white!' } }" />
        <Button @click="model += 1" label="+" class="shrink-0 px-12!"></Button>
      </div>

      <TapTempo class="shrink-0" @update:bpm="model = $event" />
    </div>
    <div class="w-full flex overflow-x-auto sm:grid grid-cols-4 md:grid-cols-7 gap-4">
      <Button v-for="tempo in defaultTempoList" :key="tempo" class="shrink-0 p-3!" @click="model = tempo">{{ tempo
      }}</Button>
      <Button class="shrink-0" @click="openDialog = true">More</Button>
    </div>
  </div>


  <Dialog v-model:visible="openDialog" modal header="Select BPM" :style="{ width: '35rem' }">
    <div class="grid grid-cols-2 gap-4">
      <template v-for="tempo in Array.from({ length: 151 }, (_, i) => i + 50)" :key="tempo">
        <Button v-if="tempo % 10 === 0" class="shrink-0 p-4! font-bold" @click="handleSelectBPM(tempo)">
          {{ tempo }}
        </Button>
      </template>
    </div>
  </Dialog>
</template>
