<script setup>
import { ref } from 'vue'
import { Drawer } from 'primevue'
import { IconAdjustmentsHorizontal, IconX } from '@tabler/icons-vue'
import MixerChannel from '@/components/MixerChannel.vue'

defineProps({
  instrumentNotes: { type: Array, required: true },
})

const emit = defineEmits(['changeVolume'])
const visible = ref(false)
const changeVolume = (note, value) => emit('changeVolume', note, value)
</script>

<template>
  <button
    type="button"
    class="fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full border border-teal-500 bg-gray-950 px-5 py-3 font-semibold text-white shadow-xl shadow-black/40 transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
    aria-label="เปิด Mixer"
    @click="visible = true"
  >
    <IconAdjustmentsHorizontal :size="20" aria-hidden="true" />
    Mixer
  </button>

  <Drawer v-model:visible="visible" position="bottom" :style="{ height: 'min(78vh, 600px)' }">
    <template #container="{ closeCallback }">
      <div
        class="flex h-full flex-col overflow-hidden border-t border-gray-700 bg-gray-900 text-white"
      >
        <header
          class="flex shrink-0 items-center justify-between border-b border-gray-700 bg-gray-950 px-5 py-4"
        >
          <div class="flex items-center gap-3">
            <IconAdjustmentsHorizontal :size="26" class="text-teal-400" aria-hidden="true" />
            <div>
              <h2 class="text-lg font-bold tracking-wide">Mixer</h2>
              <p class="text-xs text-gray-400">
                {{ instrumentNotes.length }} channels · ระดับเสียงแยกตามเครื่องดนตรี
              </p>
            </div>
          </div>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-300 hover:bg-gray-800 hover:text-white"
            aria-label="ปิด Mixer"
            @click="closeCallback"
          >
            <IconX :size="22" aria-hidden="true" />
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-6">
          <div class="flex min-w-max gap-3 pb-2">
            <MixerChannel
              v-for="(instrument, index) in instrumentNotes"
              :key="instrument.id"
              :instrument
              :index
              @change-volume="changeVolume"
            />
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>
