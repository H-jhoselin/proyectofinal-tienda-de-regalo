<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  // Emoji que se muestra si el regalo no tiene imagen (el ícono de su ocasión)
  icono: { type: String, default: '🎁' },
  pequena: { type: Boolean, default: false },
})

const fallo = ref(false)
watch(() => props.src, () => (fallo.value = false))
</script>

<template>
  <img v-if="src && !fallo" :src="src" :alt="alt" class="w-full object-cover" @error="fallo = true" />
  <div
    v-else
    role="img"
    :aria-label="alt"
    class="flex w-full items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-amber-100"
    :class="pequena ? 'text-xl' : 'text-6xl'"
  >
    {{ icono || '🎁' }}
  </div>
</template>
