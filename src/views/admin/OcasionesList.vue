<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ocasionesService } from '@/services/ocasiones'
import { regalosService } from '@/services/regalos'
import EncabezadoPagina from '@/components/EncabezadoPagina.vue'
import { mensajeError, debounce } from '@/utils/formato'

const ocasiones = ref([])
const regalos = ref([])
const busqueda = ref('')
const cargando = ref(true)
const error = ref('')
const aviso = ref('')

const regalosPorOcasion = computed(() => {
  const conteo = {}
  for (const r of regalos.value) conteo[r.ocasionId] = (conteo[r.ocasionId] || 0) + 1
  return conteo
})

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    ;[ocasiones.value, regalos.value] = await Promise.all([
      ocasionesService.listar({ busqueda: busqueda.value }),
      regalosService.listar(),
    ])
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
}

watch(busqueda, debounce(cargar, 300))
onMounted(cargar)

async function eliminar(o) {
  aviso.value = ''
  const cantidad = regalosPorOcasion.value[o.id] || 0
  if (cantidad) {
    error.value = `No se puede eliminar "${o.nombre}": tiene ${cantidad} regalo(s) asociados. Reasígnalos o elimínalos primero.`
    return
  }
  if (!confirm(`¿Eliminar la ocasión "${o.nombre}"?`)) return
  try {
    await ocasionesService.eliminar(o.id)
    aviso.value = `Ocasión "${o.nombre}" eliminada.`
    await cargar()
  } catch (e) {
    error.value = mensajeError(e)
  }
}
</script>

<template>
  <EncabezadoPagina titulo="Ocasiones" subtitulo="Fechas y motivos para los que se ofrecen regalos.">
    <RouterLink :to="{ name: 'ocasion-nueva' }" class="btn btn-primario">+ Nueva ocasión</RouterLink>
  </EncabezadoPagina>

  <div class="card mb-4 p-4">
    <label for="buscar" class="mb-1 block text-sm font-medium text-gray-700">Buscar por nombre</label>
    <input id="buscar" v-model="busqueda" type="search" class="input sm:max-w-sm" placeholder="Ej.: Navidad" />
  </div>

  <p v-if="error" class="alerta-error mb-4">{{ error }}</p>
  <p v-if="aviso" class="alerta-exito mb-4">{{ aviso }}</p>

  <div class="card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="tabla">
        <thead>
          <tr>
            <th>Ícono</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th class="text-center">Regalos</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="cargando"><td colspan="5" class="py-6 text-center text-gray-500">Cargando…</td></tr>
          <tr v-else-if="!ocasiones.length"><td colspan="5" class="py-6 text-center text-gray-500">No hay ocasiones que coincidan.</td></tr>
          <template v-else>
            <tr v-for="o in ocasiones" :key="o.id">
              <td class="text-2xl">{{ o.icono }}</td>
              <td class="font-medium text-gray-900">{{ o.nombre }}</td>
              <td class="max-w-xs truncate text-gray-500">{{ o.descripcion || '—' }}</td>
              <td class="text-center">{{ regalosPorOcasion[o.id] || 0 }}</td>
              <td>
                <div class="flex justify-end gap-2">
                  <RouterLink :to="{ name: 'ocasion-editar', params: { id: o.id } }" class="btn btn-secundario btn-chico">Editar</RouterLink>
                  <button type="button" class="btn btn-peligro btn-chico" @click="eliminar(o)">Eliminar</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
