<script setup>
import { Button, Drawer } from 'primevue';
import { ref } from 'vue';

const emit = defineEmits(['changeVolume']);

const props = defineProps({
  instrumentNotes: {
    type: Object,
    required: true
  }
});

const visible = ref(false);

</script>

<template>
  <Button class="fixed bottom-0 p-3 rounded-md text-black z-3 bg-white" unstyled @click="visible = !visible">
    Mixer
  </Button>
  <div>
    <Drawer v-model:visible="visible" header="Mixer" position="bottom" style="height: auto">
      <template #container>
        <div class="h-82 bg-gray-800 w-full py-5">
          <div class="flex gap-10 w-full overflow-x-auto justify-center">
            <div class="flex flex-col items-center justify-center gap-1" v-for="instrument in props.instrumentNotes"
              :key="instrument">
              <input type="range" class="rotate-[-90deg] h-48" min="-50" max="-10" step="1"
                @input="emit('changeVolume', instrument.note, $event.target.value)" :value="instrument.volume"
                @dblclick="emit('changeVolume', instrument.note, -20)">
              <span class="font-semibold p-3 rounded-md text-white" :class="instrument.color">{{ instrument.label
              }}</span>
            </div>
          </div>
        </div>
      </template>

    </Drawer>
  </div>
</template>
