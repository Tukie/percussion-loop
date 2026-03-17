<script setup>
import { Button, Slider } from 'primevue';
import TapTempo from './TapTempo.vue';

const model = defineModel('bpm');
</script>

<template>
  <div class="flex flex-col xl:flex-row items-center justify-center gap-10 w-full">
    <div class="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
      <label for="bpm-input" class="block text-sm font-medium text-gray-400 mb-2">BPM</label>
      <input type="number" id="bpm-input" step="1" min="10" max="300"
        class="w-full max-w-[100px] bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center"
        :value="model" @change="model = $event.target.value" />
      <div class="flex items-center gap-5 w-full">
        <Button @click="model -= 1" label="-" class="shrink-0 px-12!"></Button>
        <Slider v-model="model" :min="50" :max="200" class="w-full" :pt="{ handle: { class: 'size-9! bg-white!' } }" />
        <Button @click="model += 1" label="+" class="shrink-0 px-12!"></Button>
      </div>

      <TapTempo class="shrink-0" @update:bpm="model = $event" />
    </div>
    <div class="w-full flex overflow-x-auto sm:grid grid-cols-4 md:grid-cols-7 gap-4">
      <Button class="shrink-0 p-3!" @click="model = 70">70</Button>
      <Button class="shrink-0 p-3!" @click="model = 90">90</Button>
      <Button class="shrink-0 p-3!" @click="model = 120">120</Button>
      <Button class="shrink-0 p-3!" @click="model = 136">136</Button>
      <Button class="shrink-0 p-3!" @click="model = 142">142</Button>
      <Button class="shrink-0 p-3!" @click="model = 155">155</Button>
      <Button class="shrink-0 p-3!" @click="model = 162">162</Button>
    </div>
  </div>
</template>
