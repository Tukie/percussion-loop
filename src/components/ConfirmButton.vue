<script setup>
import { useConfirm } from "primevue/useconfirm";

const props = defineProps({
  message: {
    type: String,
    default: 'คุณต้องการทำรายการหรือไม่?'
  },
  severity: {
    type: String,
    default: 'secondary'
  }
});

const confirm = useConfirm();
const emit = defineEmits(['confirm', 'cancel']);

const handleOpenConfirmDialog = (event) => {
  confirm.require({
    target: event.currentTarget,
    message: props.message,
    rejectProps: {
      label: 'ยกเลิก',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'ตกลง',
      severity: props.severity
    },
    accept: () => {
      emit('confirm');
    },
    reject: () => {
      emit('cancel');
    }
  });
};
</script>

<template>
  <div @click="handleOpenConfirmDialog($event)">
    <slot />
  </div>
</template>
