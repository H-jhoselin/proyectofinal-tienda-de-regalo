<script setup>
import { ref, onMounted } from 'vue'
import { ocasionesService } from '@/services/ocasiones'
import { mensajeError } from '@/utils/formato'
import { NOMBRE_TIENDA } from '@/config'

const ocasiones = ref([])
const error = ref('')

const pasos = [
  { icono: '🔎', titulo: 'Explora', texto: 'Busca en el catálogo y filtra por la ocasión que quieres celebrar.' },
  { icono: '📝', titulo: 'Reserva', texto: 'Elige la cantidad, la fecha de recojo y escribe una dedicatoria.' },
  { icono: '🎉', titulo: 'Sorprende', texto: 'Recoge tu regalo listo y envuelto en nuestra tienda.' },
]

onMounted(async () => {
  try {
    ocasiones.value = await ocasionesService.listar()
  } catch (e) {
    error.value = mensajeError(e)
  }
})
</script>

<template>
  <section class="bg-gradient-to-br from-rose-500 via-pink-500 to-amber-400 text-white">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <p class="text-sm font-semibold tracking-widest uppercase opacity-90">Tienda de regalos</p>
      <h1 class="mt-2 text-5xl font-extrabold tracking-tight sm:text-6xl">{{ NOMBRE_TIENDA }}</h1>
      <p class="mt-4 max-w-xl text-lg opacity-95">
        El detalle perfecto para cada ocasión. Mira nuestro catálogo y reserva tu regalo en línea para recogerlo cuando quieras.
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <RouterLink to="/catalogo" class="btn bg-white px-6 py-3 text-base text-rose-600 shadow hover:bg-rose-50">Ver catálogo</RouterLink>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-4 py-12">
    <h2 class="text-2xl font-bold text-gray-900">Regalos por ocasión</h2>
    <p class="mt-1 text-sm text-gray-500">Elige una ocasión para ver los regalos disponibles.</p>

    <p v-if="error" class="alerta-error mt-6">{{ error }}</p>
    <div v-else class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <RouterLink
        v-for="o in ocasiones"
        :key="o.id"
        :to="{ name: 'catalogo', query: { ocasion: o.id } }"
        class="card flex flex-col items-center gap-2 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md hover:ring-rose-300"
      >
        <span class="text-4xl" aria-hidden="true">{{ o.icono }}</span>
        <span class="text-sm font-semibold text-gray-800">{{ o.nombre }}</span>
      </RouterLink>
    </div>
  </section>

  <section class="bg-white">
    <div class="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3">
      <div v-for="(p, i) in pasos" :key="p.titulo" class="flex gap-4">
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-2xl">{{ p.icono }}</span>
        <div>
          <h3 class="font-semibold text-gray-900">{{ i + 1 }}. {{ p.titulo }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ p.texto }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
