<script setup>
defineProps({
  label: { type: String, required: true },
  para: { type: String, required: true },
  error: { type: String, default: '' },
  ayuda: { type: String, default: '' },
  requerido: { type: Boolean, default: false },
})
</script>

<template>
  <div>
    <label :for="para" class="mb-1 block text-sm font-medium text-gray-700">
      {{ label }}<span v-if="requerido" class="text-rose-600"> *</span>
    </label>
    <slot />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
    <p v-else-if="ayuda" class="mt-1 text-xs text-gray-500">{{ ayuda }}</p>
  </div>
</template>
