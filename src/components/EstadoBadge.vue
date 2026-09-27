<script setup>
import { computed } from 'vue'
import { infoEstado } from '@/utils/estados'

const props = defineProps({ estado: { type: String, required: true } })
const info = computed(() => infoEstado(props.estado))
</script>

<template>
  <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" :class="info.clase">{{ info.texto }}</span>
</template>
