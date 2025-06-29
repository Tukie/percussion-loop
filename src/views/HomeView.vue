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

let samplers = {};
const bpm = ref(120);
const currentStep = ref(-1);
const currentSequence = ref(null);
const sequenceName = ref('')

const instrumentNotes = ref([
  {
    id: 'charp',
    note: 'A0',
    label: 'Charp',
    color: 'bg-red-500',
    url: "charp.wav",
    pitch: 0,
    volume: -20
  },
  {
    id: 'ching',
    note: 'A1',
    label: 'Ching',
    color: 'bg-orange-500',
    url: "ching.wav",
    pitch: 0,
    volume: -20
  },
  {
    id: 'tambourine',
    note: 'A2',
    label: 'Tambourine',
    color: 'bg-pink-500',
    url: "tambourine.wav",
    pitch: 0,
    volume: -20
  },

  {
    id: 'cowbell',
    note: 'C4',
    label: 'Cowbell',
    color: 'bg-blue-500',
    url: "cow_low.wav",
    pitch: 0,
    volume: -20
  },

  {
    id: 'hiconga',
    note: 'D#4',
    label: 'Hi Conga',
    color: 'bg-green-500',
    url: "hi_conga.wav",
    pitch: 0,
    volume: -20
  },

  {
    id: 'lowconga',
    note: 'A4',
    label: 'Low Conga',
    color: 'bg-yellow-500',
    url: "low_conga.wav",
    pitch: 0,
    volume: -20
  },

]);

const numSteps = 32;

const sequence = ref(
  instrumentNotes.value.map(() => Array(numSteps).fill(false))
);

let loopNow = null;

// Sampler
const makeSampler = (data = {
  url: { key: "", value: "" },
  release: 1,
  volume: -20,
  baseUrl: "/",
}) => {
  return new Tone.Sampler({
    urls: {
      [data.url.key]: data.url.value,
    },
    release: 1,
    volume: data.volume,
    baseUrl: "/",
  })
}

const loadSamplers = () => {
  samplers = {};
  for (const instrument of instrumentNotes.value) {
    const sampler = makeSampler({
      url: {
        key: instrument.note,
        value: instrument.url,
      },
      volume: instrument.volume,
    });

    const pitchShift = new Tone.PitchShift({
      pitch: instrument?.pitch || 0,
      windowSize: 0.03,
      feedback: 0,
    });


    pitchShift.toDestination();
    sampler.connect(pitchShift);
    samplers[instrument.note] = sampler
  }
}

const changeVolume = (note, value) => {
  const findInstrument = instrumentNotes.value.find(ins => ins.note === note);
  if (!findInstrument) return;
  findInstrument.value = parseInt(value || 0);
  samplers[note].volume.value = value;
  findInstrument.volume = value;
}

const initToneLoad = () => {
  loadSamplers();

  Tone.loaded().then(() => {
    Tone.getTransport().bpm.value = bpm.value;

    let sequencerLoop = new Tone.Sequence(
      (time, stepIndex) => {
        currentStep.value = stepIndex;

        instrumentNotes.value.forEach((instrument, instIndex) => {
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

const init = () => {
  initToneLoad();
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
  if (Tone.context.state !== 'running') {
    await Tone.start();
    console.log('Audio Context started/resumed');
  }
  Tone.getTransport().start();
};

const stopSequencer = async () => {
  Tone.getTransport().stop();
  currentStep.value = -1;
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
      bpm: bpm.value
    }
  ));
  listAllSavedSequences();
};

const deleteSequence = (key) => {
  localStorage.removeItem(key);
  listAllSavedSequences();
};

const loadSequence = (key = null) => {
  if (!key) return

  let savedSequence = localStorage.getItem(key);
  if (!savedSequence) return

  savedSequence = JSON.parse(savedSequence);

  if (Tone.getTransport().state !== 'started') {
    currentSequence.value = key;
    sequence.value = savedSequence.sequence;
    sequenceName.value = savedSequence.name;
    startSequencer();
    removeQueue(key);
    return
  }

  loopNow = setInterval(() => {
    console.log("Interval Load sq");

    if (currentStep.value >= 29 && currentStep.value <= 32) {
      sequence.value = savedSequence.sequence;
      currentSequence.value = key;
      sequenceName.value = savedSequence.name;
      clearInterval(loopNow);
      removeQueue(key);
    }
  }, 100);

};

const loadSequenceByIndex = (index = 0) => {
  const keys = Object.keys(localStorage);
  const filter = keys.filter(key => key.startsWith('sequence-'));
  if (filter[index]) {
    addToQueue(filter[index]);

  }
}

const allSavedSequences = ref([]);
const listAllSavedSequences = () => {
  const keys = Object.keys(localStorage);
  const filterKey = keys.filter(key => key.startsWith('sequence-'));
  allSavedSequences.value = filterKey.map(key => {
    return JSON.parse(localStorage.getItem(key));
  });
};

const clearAllSavedSequences = () => {
  allSavedSequences.value.forEach(key => localStorage.removeItem(key));
  allSavedSequences.value = [];
};

const playSelectedSound = (key = null) => {
  if (!key) return;
  if (samplers[key]) {
    samplers[key].triggerAttackRelease(key, "8n");
  }
}

const keyBinding = () => {
  document.addEventListener('keydown', (event) => {
    const numpadNumber = Array.from({ length: 9 }, (_, i) => `Numpad${i + 1}`);
    if (numpadNumber.includes(event.code)) {
      loadSequenceByIndex(event.code.replace("Numpad", "") - 1);
      return;
    }

    switch (event.code) {
      case "Numpad0":
        if (Tone.getTransport().state === 'started') {
          stopSequencer();
          return;
        }
        startSequencer();
        break;
      case "NumpadAdd":
        setBpm(bpm.value + 1);
        break;
      case "NumpadSubtract":
        setBpm(bpm.value - 1);
        break;

      default:
        break;
    }

  });
}

watch(bpm, (newBpm) => {
  setBpm(newBpm);
});

onMounted(() => {
  init();
  listAllSavedSequences();
  keyBinding();
});
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
    <main class="w-full bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6 border border-gray-700 container mx-auto">
      <h1 class="text-4xl font-extrabold text-center text-teal-400 mb-8">Percussion Loop</h1>
      <Accordion value="0">
        <AccordionPanel value="0">
          <AccordionHeader>ขัดการจังหวะ</AccordionHeader>
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
                  <div v-for="(instrument, instIndex) in instrumentNotes" :key="instrument.id"
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

              <div class="flex flex-col mx-auto max-w-42 item-center gap-5 justify-center">
                <input type="text" v-model="sequenceName"
                  class=" bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-center">
                <Button @click="saveSequence" :disabled="sequenceName.trim() === ''">
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

      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        <LoopItem v-for="sq in allSavedSequences" :key="sq" @addToQueue="addToQueue" @deleteSequence="deleteSequence"
          :sq :playing="currentSequence === sq.id" :inQueue="sequenceQueue.includes(sq.id)" />
      </div>
    </main>

    <MixerComponent :instrumentNotes @changeVolume="changeVolume" />
  </div>
</template>
