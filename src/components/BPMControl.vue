<script setup>
import { Button, Slider } from 'primevue';
import TapTempo from './TapTempo.vue';

const model = defineModel('bpm');
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
      <Button class="shrink-0 p-3!" @click="model = 70">70</Button>
      <Button class="shrink-0 p-3!" @click="model = 90">90</Button>
      <Button class="shrink-0 p-3!" @click="model = 136">136</Button>
      <Button class="shrink-0 p-3!" @click="model = 142">142</Button>
      <Button class="shrink-0 p-3!" @click="model = 155">155</Button>
      <Button class="shrink-0 p-3!" @click="model = 162">162</Button>
    </div>
  </div>
</template>
