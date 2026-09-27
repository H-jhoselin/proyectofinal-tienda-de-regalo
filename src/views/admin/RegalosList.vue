<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { regalosService } from '@/services/regalos'
import { ocasionesService } from '@/services/ocasiones'
import { reservasService } from '@/services/reservas'
import EncabezadoPagina from '@/components/EncabezadoPagina.vue'
import RegaloImagen from '@/components/RegaloImagen.vue'
import { moneda, mensajeError, debounce } from '@/utils/formato'

const regalos = ref([])
const ocasiones = ref([])
const busqueda = ref('')
const ocasionId = ref('')
const cargando = ref(true)
const error = ref('')
const aviso = ref('')

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

watch(busqueda, debounce(cargar, 300))
watch(ocasionId, cargar)

onMounted(async () => {
  try {
    ocasiones.value = await ocasionesService.listar()
  } catch (e) {
    error.value = mensajeError(e)
  }
  cargar()
})

async function eliminar(r) {
  aviso.value = ''
  error.value = ''
  try {
    // json-server borra en cascada las reservas de un regalo; se evita para no perder el historial
    const reservas = await reservasService.listar({ regaloId: r.id })
    if (reservas.length) {
      error.value = `No se puede eliminar "${r.nombre}": tiene ${reservas.length} reserva(s) registradas.`
      return
    }
    if (!confirm(`¿Eliminar el regalo "${r.nombre}"?`)) return
    await regalosService.eliminar(r.id)
    aviso.value = `Regalo "${r.nombre}" eliminado.`
    await cargar()
  } catch (e) {
    error.value = mensajeError(e)
  }
}
</script>

<template>
  <EncabezadoPagina titulo="Regalos" subtitulo="Productos que se muestran en el catálogo.">
    <RouterLink :to="{ name: 'regalo-nuevo' }" class="btn btn-primario">+ Nuevo regalo</RouterLink>
  </EncabezadoPagina>

  <div class="card mb-4 flex flex-col gap-3 p-4 sm:flex-row">
    <div class="flex-1">
      <label for="buscar" class="mb-1 block text-sm font-medium text-gray-700">Buscar por nombre</label>
      <input id="buscar" v-model="busqueda" type="search" class="input" placeholder="Ej.: peluche" />
    </div>
    <div class="sm:w-60">
      <label for="ocasion" class="mb-1 block text-sm font-medium text-gray-700">Filtrar por ocasión</label>
      <select id="ocasion" v-model="ocasionId" class="input">
        <option value="">Todas</option>
        <option v-for="o in ocasiones" :key="o.id" :value="String(o.id)">{{ o.icono }} {{ o.nombre }}</option>
      </select>
    </div>
  </div>

  <p v-if="error" class="alerta-error mb-4">{{ error }}</p>
  <p v-if="aviso" class="alerta-exito mb-4">{{ aviso }}</p>

  <div class="card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="tabla">
        <thead>
          <tr>
            <th></th>
            <th>Nombre</th>
            <th>Ocasión</th>
            <th class="text-right">Precio</th>
            <th class="text-center">Stock</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="cargando"><td colspan="6" class="py-6 text-center text-gray-500">Cargando…</td></tr>
          <tr v-else-if="!regalos.length"><td colspan="6" class="py-6 text-center text-gray-500">No hay regalos que coincidan.</td></tr>
          <template v-else>
            <tr v-for="r in regalos" :key="r.id">
              <td class="w-16">
                <RegaloImagen :src="r.imagen" :alt="r.nombre" :icono="ocasionesPorId[r.ocasionId]?.icono" pequena class="h-12 w-12 rounded-lg" />
              </td>
              <td>
                <p class="font-medium text-gray-900">{{ r.nombre }}</p>
                <p class="max-w-xs truncate text-xs text-gray-500">{{ r.descripcion }}</p>
              </td>
              <td>{{ ocasionesPorId[r.ocasionId]?.nombre || '—' }}</td>
              <td class="text-right whitespace-nowrap">{{ moneda(r.precio) }}</td>
              <td class="text-center">
                <span
                  class="inline-flex min-w-8 justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="r.stock === 0 ? 'bg-red-100 text-red-700' : r.stock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'"
                >
                  {{ r.stock }}
                </span>
              </td>
              <td>
                <div class="flex justify-end gap-2">
                  <RouterLink :to="{ name: 'regalo-editar', params: { id: r.id } }" class="btn btn-secundario btn-chico">Editar</RouterLink>
                  <button type="button" class="btn btn-peligro btn-chico" @click="eliminar(r)">Eliminar</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
