<script setup>
import { useTapTempo } from '@/composable/useTapTempo';
import { Button, Dialog } from 'primevue';
import { ref } from 'vue';

const { bpm, tap, reset } = useTapTempo(2500); // reset after 2.5 seconds of no taps

const openDialog = ref(false);

const emit = defineEmits(['update:bpm']);

const handleUseBPM = () => {

  if (!bpm.value || bpm.value < 40 || bpm.value > 180) {
    openDialog.value = false;
    return;
  }

  emit('update:bpm', bpm.value);
  openDialog.value = false;
};
</script>

<template>
  <Button class="shrink-0" @click="openDialog = true">Tap Tempo</Button>

  <Dialog v-model:visible="openDialog" modal header="Tap Tempo" :style="{ width: '25rem' }">
    <div class="flex flex-col gap-8 items-center justify-center p-5">
      <p class="text-2xl font-bold">BPM</p>
      <p class="text-2xl font-bold">{{ bpm }}</p>
      <Button type="button" label="Tap" @click="tap()" size="large" class="w-39" />

      <div class="flex w-full items-center gap-4 my-5">
        <Button type="button" label="Save" @click="handleUseBPM" class="w-full"></Button>
        <Button type="button" severity="contrast" label="Reset" @click="reset(); openDialog = false"
          class="w-full"></Button>
      </div>

    </div>
  </Dialog>
</template>
