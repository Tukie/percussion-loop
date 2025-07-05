<script setup>
import BPMControl from '@/components/BPMControl.vue';
import LoopItem from '@/components/LoopItem.vue';
import MixerComponent from '@/components/MixerComponent.vue';
import { Button } from 'primevue';
import * as Tone from 'tone';
import { onMounted, ref, watch } from 'vue';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import { getGetInstrument } from '@/services/instrument.service';
import { loadSamplers } from '@/services/sampler.service';
import { keyMapping } from '@/services/keyMapping.service';
import { getDefaultSequence } from '@/services/sequences.service';

let samplers = {};
const bpm = ref(120);
const currentStep = ref(-1);

const currentSequence = ref(null);
const sequenceName = ref('')
const sequenceColor = ref('#ffffff');
const sequenceCategory = ref('');
const numpadKey = ref('');

const instruments = ref(getGetInstrument());

const numSteps = 32;

const sequence = ref(
  instruments.value.map(() => Array(numSteps).fill(false))
);

let loopNow = null;

const changeVolume = (note, value) => {
  const findInstrument = instruments.value.find(ins => ins.note === note);
  if (!findInstrument) return;
  findInstrument.value = parseInt(value || 0);
  samplers[note].volume.value = value;
  findInstrument.volume = value;
}

const initToneLoad = () => {
  samplers = loadSamplers(instruments.value);

  Tone.loaded().then(() => {
    Tone.getTransport().bpm.value = bpm.value;

    let sequencerLoop = new Tone.Sequence(
      (time, stepIndex) => {
        currentStep.value = stepIndex;

        instruments.value.forEach((instrument, instIndex) => {
          if (sequence.value[instIndex][stepIndex]) {
            samplers[instrument.note].triggerAttackRelease(instrument.note, "32n", time);
          }
        });
      },
      Array.from({ length: numSteps }, (_, i) => i),
      "32n"
    );

    sequencerLoop.start(0);
  });
}

const toggleStep = (instrumentIndex, stepIndex) => {
  if (sequence.value[instrumentIndex]) {
    sequence.value[instrumentIndex][stepIndex] = !sequence.value[instrumentIndex][stepIndex];
  }
};

const setBpm = (bpmValue) => {
  const parsedBpm = parseInt(bpmValue);
  if (isNaN(parsedBpm) || parsedBpm < 20 || parsedBpm > 200) return
  bpm.value = parsedBpm;
  Tone.getTransport().bpm.value = parsedBpm;
};

// Queue
const sequenceQueue = ref([]);

const addToQueue = (key) => {
  clearInterval(loopNow);
  if (sequenceQueue.value.includes(key)) return;
  removeAllQueue();
  sequenceQueue.value.push(key);
}

const removeQueue = (key) => {
  sequenceQueue.value = sequenceQueue.value.filter(k => k !== key);
}

const removeAllQueue = () => {
  sequenceQueue.value = [];
  currentSequence.value = null;
}

watch(sequenceQueue, (queue) => {
  if (queue) {
    loadSequence(queue[0]);
  }
}, { deep: true });

// Sequence
const startSequencer = async () => {
  if (Tone.getContext().state !== 'running') {
    await Tone.start();
    console.log('Audio Context started/resumed');
  }
  Tone.getTransport().start();
};

const stopSequencer = async () => {
  Tone.getTransport().stop();
  currentStep.value = -1;
  currentSequence.value = null;
  clearInterval(loopNow);
  removeAllQueue();
};

let intervalHalfBar = null;
const playHalfBar = () => {
  clearInterval(intervalHalfBar);

  if (Tone.getTransport().state !== 'started') {
    return;
  }

  intervalHalfBar = setInterval(() => {

    console.log("Interval From sw 2.4");

    if (currentStep.value === 31) {
      clearInterval(intervalHalfBar);

      setTimeout(() => {
        Tone.getTransport().position = "0:2:0";
      }, 22);
    }
  }, 20);
}

const saveSequence = () => {
  const findExitName = allSavedSequences.value.find(sq => sq.name === sequenceName.value);
  if (findExitName) {
    localStorage.removeItem(findExitName.id);
  }

  const randomKey = Math.random().toString(36).substring(2, 15);
  localStorage.setItem(`sequence-${randomKey}`, JSON.stringify(
    {
      id: `sequence-${randomKey}`,
      name: sequenceName.value,
      sequence: sequence.value,
      bpm: bpm.value,
      color: sequenceColor.value,
      category: sequenceCategory.value,
      numpad: numpadKey.value
    }
  ));

  listAllSavedSequences();
};

const deleteSequence = (key) => {
  localStorage.removeItem(key);
  listAllSavedSequences();
};

const setSequenceDetails = (savedSequence, key) => {
  sequence.value = savedSequence.sequence;
  currentSequence.value = key;
  sequenceName.value = savedSequence.name;
  sequenceColor.value = savedSequence.color;
  sequenceCategory.value = savedSequence.category;
  numpadKey.value = savedSequence.numpad;
};

const loadSequence = (key = null) => {
  if (!key) return

  let savedSequence = localStorage.getItem(key);
  if (!savedSequence) return

  savedSequence = JSON.parse(savedSequence);

  if (Tone.getTransport().state !== 'started') {
    setSequenceDetails(savedSequence, key);
    startSequencer();
    removeQueue(key);
    return
  }

  loopNow = setInterval(() => {
    console.log("Interval Load sq");
    if (currentStep.value >= 29 && currentStep.value <= 32) {
      clearInterval(loopNow);
      setSequenceDetails(savedSequence, key);
      removeQueue(key);
    }
  }, 100);

};

const allSavedSequences = ref([]);
const groupByCategory = ref([]);
const groupSequenceByCategory = () => {
  groupByCategory.value = [];
  allSavedSequences.value.forEach(sq => {
    const findGroupName = groupByCategory.value.find(group => group.name === sq.category);
    if (findGroupName) {
      findGroupName.sequences.push(sq);
    } else {
      groupByCategory.value.push({
        name: sq.category,
        sequences: [sq]
      });
    }
  })
}

const listAllSavedSequences = () => {
  const keys = Object.keys(localStorage);
  const filterKey = keys.filter(key => key.startsWith('sequence-'));
  allSavedSequences.value = filterKey.map(key => {
    return JSON.parse(localStorage.getItem(key));
  });

  groupSequenceByCategory();
  initKeyMapping();
};

const clearAllSavedSequences = () => {
  localStorage.clear();
  listAllSavedSequences();
}

const setDefaultSequences = () => {
  const sequences = getDefaultSequence();
  sequences.forEach(sq => {
    localStorage.setItem(sq.id, JSON.stringify(sq));
  })

  listAllSavedSequences();
}

const playSelectedSound = (key = null) => {
  if (!key) return;
  if (samplers[key]) {
    samplers[key].triggerAttackRelease(key, "8n");
  }
}

const initKeyMapping = () => {
  const keys = [
    { key: 'Numpad0', function: () => stopSequencer() },
    { key: 'NumpadAdd', function: () => setBpm(bpm.value + 1) },
    { key: 'NumpadSubtract', function: () => setBpm(bpm.value - 1) },
    { key: 'NumpadDecimal', function: () => playHalfBar() },
  ];

  allSavedSequences.value.forEach(sq => {
    if (sq.numpad) {
      const findDuplicate = keys.find(k => k.key === sq.numpad);
      if (!findDuplicate) {
        keys.push({
          key: sq.numpad, function: () => {
            addToQueue(sq.id)
          }
        });
      }
    }
  }
  )

  keyMapping(keys);
}

watch(bpm, (newBpm) => {
  setBpm(newBpm);
});

onMounted(() => {
  initToneLoad();
  clearAllSavedSequences();
  setDefaultSequences();
});
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
    <main class="w-full bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6 border border-gray-700 container mx-auto">
      <h1 class="text-4xl font-extrabold text-center text-teal-400 mb-8">Percussion Loop</h1>
      <Accordion value="0">
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
        <AccordionPanel value="1">
          <AccordionHeader>ควบคุม</AccordionHeader>
          <AccordionContent>
            <div class="">
              <BPMControl :bpm @setBpm="setBpm" />
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>

      <!-- Playback Buttons -->
      <div class="flex gap-4 justify-center items-center">
        <button @click="startSequencer"
          class="bg-lime-600 hover:bg-lime-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center space-x-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button @click="playHalfBar"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center space-x-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
          <span>สลับ 2/4</span>
        </button>
        <button @click="stopSequencer"
          class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center space-x-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>
      </div>

      <!-- Light -->
      <div class="flex gap-2 justify-center">
        <div class="h-4 w-8 rounded-sm" :class="currentStep >= 1 && currentStep <= 8 ? 'bg-yellow-300' : 'bg-gray-600'">
        </div>
        <div class="h-4 w-8 rounded-sm"
          :class="currentStep >= 9 && currentStep <= 16 ? 'bg-yellow-300' : 'bg-gray-600'"></div>
        <div class="h-4 w-8 rounded-sm"
          :class="currentStep >= 17 && currentStep <= 24 ? 'bg-yellow-300' : 'bg-gray-600'"></div>
        <div class="h-4 w-8 rounded-sm" :class="currentStep >= 25 ? 'bg-yellow-300' : 'bg-gray-600'"></div>
      </div>

      <!-- Saved list -->
      <hr class="my-10" />

      <div class="flex flex-col gap-5" v-for="group in groupByCategory" :key="group">
        <span class="fw-semibold text-lg p-2 rounded-full bg-gray-700 text-center mb-3">{{ group.name }}</span>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          <LoopItem v-for="sq in group.sequences" :key="sq" @addToQueue="addToQueue" @deleteSequence="deleteSequence"
            :sq :playing="currentSequence === sq.id" :inQueue="sequenceQueue.includes(sq.id)" />
        </div>
      </div>

    </main>

    <MixerComponent :instrumentNotes="instruments" @changeVolume="changeVolume" />
  </div>
</template>
