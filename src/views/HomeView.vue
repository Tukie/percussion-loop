<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import BPMControl from '@/components/BPMControl.vue'
import LoopGridCell from '@/components/LoopGridCell.vue'
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
  activeCategory,
  activeGroup,
  pageCount,
  loopPages,
  ordering,
  selectedLoopId,
  changeVolume,
  toggleStep,
  startSequencer,
  stopSequencer,
  playHalfBar,
  saveSequence,
  deleteSequence,
  exportSequences,
  importSequences,
  toggleOrdering,
  selectLoop,
  placeSequence,
  playSelectedSound,
  addToQueue,
} = usePercussionLoop()

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()
const hasServiceWorker = ref(false)
const canUseOffline = computed(() => offlineReady.value || hasServiceWorker.value)
const backupInput = ref(null)
const backupMessage = ref('')
const backupError = ref(false)

onMounted(() => {
  hasServiceWorker.value = Boolean(navigator.serviceWorker?.controller)
})

const downloadBackup = () => {
  try {
    const backup = exportSequences()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `percussion-loop-${new Date().toISOString().slice(0, 10)}.json`
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    backupError.value = false
    backupMessage.value = 'ส่งออกไฟล์สำรองแล้ว'
  } catch {
    backupError.value = true
    backupMessage.value = 'ส่งออกไฟล์สำรองไม่สำเร็จ'
  }
}

const chooseBackup = () => backupInput.value?.click()

const restoreBackup = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!window.confirm('นำเข้าจังหวะจากไฟล์นี้และแทนที่จังหวะที่บันทึกอยู่ในแอปนี้หรือไม่?')) return

  try {
    const backup = JSON.parse(await file.text())
    const count = importSequences(backup)
    backupError.value = false
    backupMessage.value = `นำเข้าจังหวะ ${count} รายการแล้ว`
  } catch (error) {
    backupError.value = true
    backupMessage.value = error instanceof SyntaxError ? 'ไฟล์ JSON ไม่ถูกต้อง' : error.message
  }
}
</script>

<template>
  <div class="bg-gray-900 text-white flex items-center justify-center">
    <main
      class="w-full bg-gray-800 rounded-xl shadow-2xl space-y-6 border border-gray-700 px-8 py-2"
    >
      <div
        v-if="canUseOffline || needRefresh"
        class="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-teal-700 bg-gray-900 px-4 py-2 text-sm"
      >
        <span v-if="canUseOffline" class="text-teal-300">พร้อมใช้งานออฟไลน์บนอุปกรณ์นี้</span>
        <template v-if="needRefresh">
          <span>มีเวอร์ชันใหม่</span>
          <button
            type="button"
            :disabled="currentStep !== -1"
            class="rounded bg-teal-600 px-3 py-1 font-semibold disabled:opacity-50"
            @click="updateServiceWorker()"
          >
            {{ currentStep === -1 ? 'อัปเดตตอนนี้' : 'หยุดเล่นก่อนอัปเดต' }}
          </button>
        </template>
      </div>
      <Accordion>
        <AccordionPanel value="0">
          <AccordionHeader>จัดการจังหวะ</AccordionHeader>
          <AccordionContent>
            <div class="">
              <!-- Sequencer Grid -->
              <div class="overflow-x-auto flex justify-start 2xl:justify-center mb-10">
                <div class="min-w-max">
                  <!-- Column Headers for Steps -->
                  <div
                    class="flex items-center text-sm font-semibold text-gray-400 mb-2 pl-[120px]"
                  >
                    <div
                      v-for="step in numSteps"
                      :key="step"
                      class="w-8 h-8 flex items-center justify-center mx-0.5"
                      :class="{ 'text-teal-400': (step - 1) % 16 === 0 }"
                    >
                      {{ step % 16 === 0 ? 16 : step % 16 }}
                    </div>
                  </div>

                  <!-- Instrument Rows -->
                  <div
                    v-for="(instrument, instIndex) in instruments"
                    :key="instrument.id"
                    class="flex items-center mb-1"
                  >
                    <button
                      :class="[
                        instrument.color,
                        'w-28 text-sm py-2 px-2 rounded-l-lg font-bold mr-2 flex-shrink-0',
                      ]"
                      @click="playSelectedSound(instrument.note)"
                    >
                      {{ instrument.label }}
                    </button>
                    <div class="flex flex-grow">
                      <button
                        v-for="(isOn, stepIndex) in sequence[instIndex]"
                        :key="`${instrument.id}-${stepIndex}`"
                        @click="toggleStep(instIndex, stepIndex)"
                        class="w-8 h-8 rounded-md mx-0.5 transition-all duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800"
                        :class="{
                          'bg-teal-600 border border-teal-500 shadow-md': isOn,
                          'bg-gray-700 border border-gray-600': !isOn,
                          'ring-2 ring-blue-400': currentStep === stepIndex,
                          'ring-1 ring-offset-0 ring-gray-500':
                            stepIndex % 16 === 0 || stepIndex % 16 === 8,
                        }"
                      ></button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col mx-auto max-w-md item-center gap-5 justify-center">
                <div class="flex flex-col md:flex-row gap-2 items-center justify-center">
                  <div>
                    <label for="sequence-color" class="block text-sm font-medium text-gray-400 mb-2"
                      >สี</label
                    >
                    <input type="color" v-model="sequenceColor" class="w-10 h-10" />
                  </div>
                  <div>
                    <label
                      for="sequence-category"
                      class="block text-sm font-medium text-gray-400 mb-2"
                      >ประเภท</label
                    >
                    <input
                      type="text"
                      v-model="sequenceCategory"
                      class="bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center"
                    />
                  </div>
                  <div>
                    <label for="sequence-name" class="block text-sm font-medium text-gray-400 mb-2"
                      >ชื่อ</label
                    >
                    <input
                      type="text"
                      v-model="sequenceName"
                      class="bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center"
                    />
                  </div>
                  <div>
                    <label
                      for="sequence-numpad"
                      class="block text-sm font-medium text-gray-400 mb-2"
                      >Numpad Key</label
                    >
                    <input
                      type="text"
                      v-model="numpadKey"
                      class="bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center"
                    />
                  </div>
                </div>
                <Button
                  @click="saveSequence"
                  :disabled="
                    sequenceName.trim() === '' ||
                    sequenceCategory.trim() === '' ||
                    sequenceColor.trim() === ''
                  "
                  class="mx-auto"
                >
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
        <button
          @click="startSequencer"
          class="bg-lime-600 hover:bg-lime-700 text-white font-bold py-5 px-16 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center space-x-2"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button
          @click="playHalfBar"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-16 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center space-x-2"
          :class="{ 'ring-4 ring-yellow-500': waitingForHalfBar }"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
          <span>สลับ 2/4</span>
        </button>
        <button
          @click="stopSequencer"
          class="bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-16 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center space-x-2"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>
      </div>

      <!-- Light -->
      <div class="flex gap-2 justify-center">
        <div
          class="h-2 w-4 rounded-sm"
          :class="currentStep >= 1 && currentStep <= 8 ? 'bg-yellow-300' : 'bg-gray-600'"
        ></div>
        <div
          class="h-2 w-4 rounded-sm"
          :class="currentStep >= 9 && currentStep <= 16 ? 'bg-yellow-300' : 'bg-gray-600'"
        ></div>
        <div
          class="h-2 w-4 rounded-sm"
          :class="currentStep >= 17 && currentStep <= 24 ? 'bg-yellow-300' : 'bg-gray-600'"
        ></div>
        <div
          class="h-2 w-4 rounded-sm"
          :class="currentStep >= 25 ? 'bg-yellow-300' : 'bg-gray-600'"
        ></div>
      </div>

      <section v-if="activeGroup" class="space-y-5">
        <div class="flex flex-wrap items-center justify-center gap-3">
          <div
            role="group"
            aria-label="กลุ่มจังหวะ"
            class="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-gray-700 bg-gray-900 p-1.5 shadow-inner"
          >
            <button
              v-for="group in groupByCategory"
              :key="group.name"
              type="button"
              :aria-pressed="activeCategory === group.name"
              @click="activeCategory = group.name"
              class="min-w-28 shrink-0 rounded-full px-6 py-2.5 text-base font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
              :class="
                activeCategory === group.name
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-950/50'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              "
            >
              {{ group.name }}
            </button>
          </div>
          <button
            type="button"
            class="rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
            :class="
              ordering
                ? 'border-teal-400 bg-teal-600 text-white'
                : 'border-gray-600 bg-gray-900 text-gray-300 hover:bg-gray-700'
            "
            :aria-pressed="ordering"
            @click="toggleOrdering"
          >
            {{ ordering ? 'เสร็จสิ้น' : 'จัดเรียงช่อง' }}
          </button>
        </div>
        <p v-if="ordering" class="text-center text-sm text-gray-300">
          เลือก loop ด้วยช่องสี่เหลี่ยม แล้วแตะช่องที่จะวาง หากช่องนั้นมี loop อยู่จะสลับตำแหน่งกัน
        </p>
        <div class="space-y-8">
          <div v-for="page in loopPages" :key="page.number" class="space-y-3">
            <h2 v-if="pageCount > 1" class="text-center text-sm font-medium text-gray-400">
              หน้า {{ page.number }}
            </h2>
            <div class="overflow-x-auto">
              <div class="grid min-w-[720px] grid-cols-4 gap-4">
                <LoopGridCell
                  v-for="slot in page.slots"
                  :key="`${activeCategory}-${slot.position}`"
                  :position="slot.position"
                  :sequence="slot.sequence"
                  :ordering
                  :selected-loop-id="selectedLoopId"
                  :playing="currentSequence === slot.sequence?.id"
                  :in-queue="sequenceQueue.includes(slot.sequence?.id)"
                  @select-loop="selectLoop"
                  @place-sequence="placeSequence"
                  @addToQueue="addToQueue"
                  @deleteSequence="deleteSequence"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        class="rounded-lg border border-gray-700 bg-gray-900 p-4 text-center"
        aria-label="สำรองจังหวะ"
      >
        <h2 class="font-semibold">สำรองจังหวะ</h2>
        <p class="mt-1 text-sm text-gray-300">
          ส่งออกจาก Safari แล้วนำเข้าในแอปบน Home Screen ได้
          การนำเข้าจะแทนที่จังหวะที่บันทึกในแอปนี้
        </p>
        <div class="mt-3 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            class="rounded-lg bg-teal-600 px-4 py-2 font-semibold"
            @click="downloadBackup"
          >
            ส่งออกไฟล์
          </button>
          <button
            type="button"
            class="rounded-lg border border-teal-500 px-4 py-2 font-semibold"
            @click="chooseBackup"
          >
            นำเข้าไฟล์
          </button>
          <input
            ref="backupInput"
            class="hidden"
            type="file"
            accept=".json,application/json"
            @change="restoreBackup"
          />
        </div>
        <p
          v-if="backupMessage"
          role="status"
          class="mt-2 text-sm"
          :class="backupError ? 'text-red-300' : 'text-teal-300'"
        >
          {{ backupMessage }}
        </p>
      </section>
    </main>

    <MixerComponent :instrumentNotes="instruments" @changeVolume="changeVolume" />
  </div>
</template>
