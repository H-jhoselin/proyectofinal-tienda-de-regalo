<script setup>
import { ref, computed, onMounted } from 'vue'
import { ocasionesService } from '@/services/ocasiones'
import { regalosService } from '@/services/regalos'
import { reservasService } from '@/services/reservas'
import EncabezadoPagina from '@/components/EncabezadoPagina.vue'
import EstadoBadge from '@/components/EstadoBadge.vue'
import { sesion } from '@/stores/sesion'
import { fecha, mensajeError } from '@/utils/formato'

const ocasiones = ref([])
const regalos = ref([])
const reservas = ref([])
const error = ref('')

const tarjetas = computed(() => [
  { texto: 'Ocasiones', valor: ocasiones.value.length, to: { name: 'ocasiones' } },
  { texto: 'Regalos', valor: regalos.value.length, to: { name: 'regalos' } },
  { texto: 'Reservas pendientes', valor: reservas.value.filter((r) => r.estado === 'pendiente').length, to: { name: 'reservas' } },
  { texto: 'Regalos agotados', valor: regalos.value.filter((r) => r.stock === 0).length, to: { name: 'regalos' } },
])

const ultimasReservas = computed(() => reservas.value.slice(0, 5))

onMounted(async () => {
  try {
    ;[ocasiones.value, regalos.value, reservas.value] = await Promise.all([
      ocasionesService.listar(),
      regalosService.listar(),
      reservasService.listar(),
    ])
  } catch (e) {
    error.value = mensajeError(e)
  }
})
</script>

<template>
  <EncabezadoPagina titulo="Resumen" :subtitulo="`Bienvenido, ${sesion.usuario?.nombre}.`" />

  <p v-if="error" class="alerta-error">{{ error }}</p>

  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <RouterLink v-for="t in tarjetas" :key="t.texto" :to="t.to" class="card p-5 transition hover:ring-rose-300">
      <p class="text-sm text-gray-500">{{ t.texto }}</p>
      <p class="mt-1 text-3xl font-bold text-gray-900">{{ t.valor }}</p>
    </RouterLink>
  </div>

  <div class="card mt-6 overflow-hidden">
    <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
      <h2 class="font-semibold text-gray-900">Últimas reservas</h2>
      <RouterLink :to="{ name: 'reservas' }" class="text-sm font-medium text-rose-600 hover:underline">Ver todas</RouterLink>
    </div>
    <div class="overflow-x-auto">
      <table class="tabla">
        <thead>
          <tr><th>#</th><th>Cliente</th><th>Regalo</th><th>Recojo</th><th>Estado</th></tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in ultimasReservas" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.cliente }}</td>
            <td>{{ r.regalo?.nombre || '—' }}</td>
            <td>{{ fecha(r.fechaRecojo) }}</td>
            <td><EstadoBadge :estado="r.estado" /></td>
          </tr>
          <tr v-if="!ultimasReservas.length">
            <td colspan="5" class="py-6 text-center text-gray-500">Aún no hay reservas.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
