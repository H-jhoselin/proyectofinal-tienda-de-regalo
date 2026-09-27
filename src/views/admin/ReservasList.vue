<script setup>
import { ref, watch, onMounted } from 'vue'
import { reservasService } from '@/services/reservas'
import EncabezadoPagina from '@/components/EncabezadoPagina.vue'
import EstadoBadge from '@/components/EstadoBadge.vue'
import { ESTADOS } from '@/utils/estados'
import { moneda, fecha, mensajeError, debounce } from '@/utils/formato'

const reservas = ref([])
const busqueda = ref('')
const estado = ref('')
const cargando = ref(true)
const error = ref('')
const aviso = ref('')

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    reservas.value = await reservasService.listar({ busqueda: busqueda.value, estado: estado.value })
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
}

watch(busqueda, debounce(cargar, 300))
watch(estado, cargar)
onMounted(cargar)

async function eliminar(r) {
  aviso.value = ''
  if (!confirm(`¿Eliminar la reserva #${r.id} de ${r.cliente}?`)) return
  try {
    await reservasService.eliminar(r)
    aviso.value = `Reserva #${r.id} eliminada.`
    await cargar()
  } catch (e) {
    error.value = mensajeError(e)
  }
}
</script>

<template>
  <EncabezadoPagina titulo="Reservas" subtitulo="Reservas realizadas desde el catálogo o registradas en tienda.">
    <RouterLink :to="{ name: 'reserva-nueva' }" class="btn btn-primario">+ Nueva reserva</RouterLink>
  </EncabezadoPagina>

  <div class="card mb-4 flex flex-col gap-3 p-4 sm:flex-row">
    <div class="flex-1">
      <label for="buscar" class="mb-1 block text-sm font-medium text-gray-700">Buscar por cliente</label>
      <input id="buscar" v-model="busqueda" type="search" class="input" placeholder="Ej.: Ana" />
    </div>
    <div class="sm:w-52">
      <label for="estado" class="mb-1 block text-sm font-medium text-gray-700">Filtrar por estado</label>
      <select id="estado" v-model="estado" class="input">
        <option value="">Todos</option>
        <option v-for="e in ESTADOS" :key="e.valor" :value="e.valor">{{ e.texto }}</option>
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
            <th>#</th>
            <th>Cliente</th>
            <th>Regalo</th>
            <th class="text-center">Cant.</th>
            <th class="text-right">Total</th>
            <th>Recojo</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="cargando"><td colspan="8" class="py-6 text-center text-gray-500">Cargando…</td></tr>
          <tr v-else-if="!reservas.length"><td colspan="8" class="py-6 text-center text-gray-500">No hay reservas que coincidan.</td></tr>
          <template v-else>
            <tr v-for="r in reservas" :key="r.id">
              <td class="text-gray-500">{{ r.id }}</td>
              <td>
                <p class="font-medium text-gray-900">{{ r.cliente }}</p>
                <p class="text-xs text-gray-500">{{ r.telefono }}</p>
              </td>
              <td>
                <p>{{ r.regalo?.nombre || 'Regalo eliminado' }}</p>
                <p v-if="r.dedicatoria" class="max-w-48 truncate text-xs text-gray-400 italic" :title="r.dedicatoria">“{{ r.dedicatoria }}”</p>
              </td>
              <td class="text-center">{{ r.cantidad }}</td>
              <td class="text-right whitespace-nowrap">{{ r.regalo ? moneda(r.regalo.precio * r.cantidad) : '—' }}</td>
              <td class="whitespace-nowrap">{{ fecha(r.fechaRecojo) }}</td>
              <td><EstadoBadge :estado="r.estado" /></td>
              <td>
                <div class="flex justify-end gap-2">
                  <RouterLink :to="{ name: 'reserva-editar', params: { id: r.id } }" class="btn btn-secundario btn-chico">Editar</RouterLink>
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
