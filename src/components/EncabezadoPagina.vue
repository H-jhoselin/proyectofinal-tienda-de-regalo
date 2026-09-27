<script setup>
defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
})
</script>

<template>
  <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ titulo }}</h1>
      <p v-if="subtitulo" class="mt-1 text-sm text-gray-500">{{ subtitulo }}</p>
    </div>
    <div class="flex gap-2"><slot /></div>
  </div>
</template>
