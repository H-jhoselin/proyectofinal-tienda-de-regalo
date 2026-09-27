<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { regalosService } from '@/services/regalos'
import { ocasionesService } from '@/services/ocasiones'
import RegaloImagen from '@/components/RegaloImagen.vue'
import { moneda, mensajeError, debounce } from '@/utils/formato'

const route = useRoute()
const router = useRouter()

const busqueda = ref(route.query.q || '')
const ocasionId = ref(route.query.ocasion || '')
const regalos = ref([])
const ocasiones = ref([])
const cargando = ref(true)
const error = ref('')

const ocasionesPorId = computed(() => Object.fromEntries(ocasiones.value.map((o) => [o.id, o])))

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    regalos.value = await regalosService.listar({ busqueda: busqueda.value, ocasionId: ocasionId.value })
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
}

const cargarConPausa = debounce(cargar, 300)
watch(busqueda, cargarConPausa)
watch(ocasionId, cargar)

// Mantiene la búsqueda y el filtro en la URL para poder compartir el enlace
watch([busqueda, ocasionId], ([q, ocasion]) => {
  router.replace({ query: { ...(q && { q }), ...(ocasion && { ocasion }) } })
})

function limpiar() {
  busqueda.value = ''
  ocasionId.value = ''
}

onMounted(async () => {
  try {
    ocasiones.value = await ocasionesService.listar()
  } catch (e) {
    error.value = mensajeError(e)
  }
  cargar()
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <h1 class="text-3xl font-bold text-gray-900">Catálogo de regalos</h1>
    <p class="mt-1 text-sm text-gray-500">Encuentra el regalo ideal y resérvalo en un par de pasos.</p>

    <!-- Buscador y filtro -->
    <div class="card mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <div class="flex-1">
        <label for="buscar" class="mb-1 block text-sm font-medium text-gray-700">Buscar por nombre</label>
        <input id="buscar" v-model="busqueda" type="search" class="input" placeholder="Ej.: peluche, taza, rosas…" />
      </div>
      <div class="sm:w-64">
        <label for="ocasion" class="mb-1 block text-sm font-medium text-gray-700">Filtrar por ocasión</label>
        <select id="ocasion" v-model="ocasionId" class="input">
          <option value="">Todas las ocasiones</option>
          <option v-for="o in ocasiones" :key="o.id" :value="String(o.id)">{{ o.icono }} {{ o.nombre }}</option>
        </select>
      </div>
      <button v-if="busqueda || ocasionId" type="button" class="btn btn-secundario" @click="limpiar">Limpiar</button>
    </div>

    <p v-if="error" class="alerta-error mt-6">{{ error }}</p>
    <p v-else-if="cargando" class="mt-10 text-center text-gray-500">Cargando regalos…</p>
    <div v-else-if="!regalos.length" class="mt-10 text-center text-gray-500">
      <p class="text-4xl">🔍</p>
      <p class="mt-2">No se encontraron regalos con esos criterios.</p>
    </div>

    <div v-else class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="r in regalos" :key="r.id" class="card flex flex-col overflow-hidden">
        <RegaloImagen :src="r.imagen" :alt="r.nombre" :icono="ocasionesPorId[r.ocasionId]?.icono" class="h-44" />
        <div class="flex flex-1 flex-col gap-2 p-4">
          <span class="self-start rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
            {{ ocasionesPorId[r.ocasionId]?.nombre || 'Sin ocasión' }}
          </span>
          <h2 class="font-semibold text-gray-900">{{ r.nombre }}</h2>
          <p class="line-clamp-2 text-sm text-gray-500">{{ r.descripcion }}</p>
          <div class="mt-auto flex items-end justify-between gap-2 pt-3">
            <div>
              <p class="text-lg font-bold text-rose-600">{{ moneda(r.precio) }}</p>
              <p class="text-xs" :class="r.stock > 0 ? 'text-gray-500' : 'font-medium text-red-600'">
                {{ r.stock > 0 ? `${r.stock} disponible(s)` : 'Agotado' }}
              </p>
            </div>
            <RouterLink v-if="r.stock > 0" :to="{ name: 'reservar', params: { id: r.id } }" class="btn btn-primario">Reservar</RouterLink>
            <button v-else type="button" class="btn btn-secundario" disabled>Agotado</button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
