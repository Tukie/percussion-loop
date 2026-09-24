<script setup>
import BPMControl from '@/components/BPMControl.vue'
import LoopItem from '@/components/LoopItem.vue'
import MixerComponent from '@/components/MixerComponent.vue'
import { usePercussionLoop } from '@/composable/usePercussionLoop'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import { Button } from 'primevue'

const {
  bpm,
  currentStep,
  currentSequence,
  sequenceName,
  sequenceColor,
  sequenceCategory,
  numpadKey,
  instruments,
  numSteps,
  sequence,
  sequenceQueue,
  waitingForHalfBar,
  groupByCategory,
  changeVolume,
  toggleStep,
  startSequencer,
  stopSequencer,
  playHalfBar,
  saveSequence,
  deleteSequence,
  playSelectedSound,
  addToQueue,
} = usePercussionLoop()
</script>

<template>
  <div class="bg-gray-900 text-white flex items-center justify-center">
    <main class="w-full bg-gray-800 rounded-xl shadow-2xl space-y-6 border border-gray-700 px-8 py-2">
      <Accordion>
        <AccordionPanel value="0">
          <AccordionHeader>จัดการจังหวะ</AccordionHeader>
          <AccordionContent>
            <div class="">
              <!-- Sequencer Grid -->
              <div class="overflow-x-auto flex justify-start 2xl:justify-center mb-10">
                <div class="min-w-max">
                  <!-- Column Headers for Steps -->
                  <div class="flex items-center text-sm font-semibold text-gray-400 mb-2 pl-[120px]">
                    <div v-for="step in numSteps" :key="step" class="w-8 h-8 flex items-center justify-center mx-0.5"
                      :class="{ 'text-teal-400': (step - 1) % 16 === 0 }">
                      {{ step % 16 === 0 ? 16 : step % 16 }}
                    </div>
                  </div>

                  <!-- Instrument Rows -->
                  <div v-for="(instrument, instIndex) in instruments" :key="instrument.id"
                    class="flex items-center mb-1">
                    <button
                      :class="[instrument.color, 'w-28 text-sm py-2 px-2 rounded-l-lg font-bold mr-2 flex-shrink-0']"
                      @click="playSelectedSound(instrument.note)">
                      {{ instrument.label }}
                    </button>
                    <div class="flex flex-grow">
                      <button v-for="(isOn, stepIndex) in sequence[instIndex]" :key="`${instrument.id}-${stepIndex}`"
                        @click="toggleStep(instIndex, stepIndex)"
                        class="w-8 h-8 rounded-md mx-0.5 transition-all duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800"
                        :class="{
                          'bg-teal-600 border border-teal-500 shadow-md': isOn,
                          'bg-gray-700 border border-gray-600': !isOn,
                          'ring-2 ring-blue-400': currentStep === stepIndex,
                          'ring-1 ring-offset-0 ring-gray-500': (stepIndex % 16 === 0 || stepIndex % 16 === 8),
                        }">
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col mx-auto max-w-md item-center gap-5 justify-center">
                <div class="flex flex-col md:flex-row gap-2 items-center justify-center">
                  <div>
                    <label for="sequence-color" class="block text-sm font-medium text-gray-400 mb-2">สี</label>
                    <input type="color" v-model="sequenceColor" class="w-10 h-10">
                  </div>
                  <div>
                    <label for="sequence-category" class="block text-sm font-medium text-gray-400 mb-2">ประเภท</label>
                    <input type="text" v-model="sequenceCategory"
                      class=" bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center">
                  </div>
                  <div>
                    <label for="sequence-name" class="block text-sm font-medium text-gray-400 mb-2">ชื่อ</label>
                    <input type="text" v-model="sequenceName"
                      class=" bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center">
                  </div>
                  <div>
                    <label for="sequence-numpad" class="block text-sm font-medium text-gray-400 mb-2">Numpad Key</label>
                    <input type="text" v-model="numpadKey"
                      class=" bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center">
                  </div>
                </div>
                <Button @click="saveSequence"
                  :disabled="sequenceName.trim() === '' || sequenceCategory.trim() === '' || sequenceColor.trim() === ''"
                  class="mx-auto">
                  บันทึก
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>

      <BPMControl v-model:bpm="bpm" />

      <!-- Playback Buttons -->
      <div class="flex gap-4 justify-center items-center">
        <button @click="startSequencer"
          class="bg-lime-600 hover:bg-lime-700 text-white font-bold py-5 px-16 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center space-x-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button @click="playHalfBar"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-16 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center space-x-2"
          :class="{ 'ring-4 ring-yellow-500': waitingForHalfBar }">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
          <span>สลับ 2/4</span>
        </button>
        <button @click="stopSequencer"
          class="bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-16 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center space-x-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>
      </div>

      <!-- Light -->
      <div class="flex gap-2 justify-center">
        <div class="h-2 w-4 rounded-sm" :class="currentStep >= 1 && currentStep <= 8 ? 'bg-yellow-300' : 'bg-gray-600'">
        </div>
        <div class="h-2 w-4 rounded-sm"
          :class="currentStep >= 9 && currentStep <= 16 ? 'bg-yellow-300' : 'bg-gray-600'"></div>
        <div class="h-2 w-4 rounded-sm"
          :class="currentStep >= 17 && currentStep <= 24 ? 'bg-yellow-300' : 'bg-gray-600'"></div>
        <div class="h-2 w-4 rounded-sm" :class="currentStep >= 25 ? 'bg-yellow-300' : 'bg-gray-600'"></div>
      </div>

      <div class="flex flex-col gap-2" v-for="group in groupByCategory" :key="group">
        <span class="fw-semibold p-2 rounded-full bg-gray-700 text-center mb-3 text-xs">{{ group.name }}</span>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          <LoopItem v-for="sq in group.sequences" :key="sq" @addToQueue="addToQueue" @deleteSequence="deleteSequence"
            :sq :playing="currentSequence === sq.id" :inQueue="sequenceQueue.includes(sq.id)" />
        </div>
      </div>

    </main>

    <MixerComponent :instrumentNotes="instruments" @changeVolume="changeVolume" />
  </div>
</template>
