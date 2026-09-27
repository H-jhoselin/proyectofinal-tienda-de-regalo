<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { reservasService } from '@/services/reservas'
import { regalosService } from '@/services/regalos'
import EncabezadoPagina from '@/components/EncabezadoPagina.vue'
import CampoForm from '@/components/CampoForm.vue'
import { ESTADOS, ocupaStock } from '@/utils/estados'
import { moneda, mensajeError } from '@/utils/formato'
import { validarReserva } from '@/utils/validaciones'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()

const esEdicion = computed(() => !!props.id)
const regalos = ref([])
const anterior = ref(null)
const form = reactive({ regaloId: '', cliente: '', telefono: '', fechaRecojo: '', cantidad: 1, dedicatoria: '', estado: 'pendiente' })
const errores = ref({})
const error = ref('')
const cargando = ref(true)
const guardando = ref(false)

const regaloSeleccionado = computed(() => regalos.value.find((r) => String(r.id) === String(form.regaloId)))

// Stock que puede usar esta reserva (en edición se suma lo que ya tenía apartado)
const stockDisponible = computed(() => {
  const r = regaloSeleccionado.value
  if (!r || !ocupaStock(form)) return null
  const propio = anterior.value && ocupaStock(anterior.value) && Number(anterior.value.regaloId) === r.id ? anterior.value.cantidad : 0
  return r.stock + propio
})

const total = computed(() => (regaloSeleccionado.value ? regaloSeleccionado.value.precio * (Number(form.cantidad) || 0) : 0))

onMounted(async () => {
  try {
    regalos.value = await regalosService.listar()
    if (esEdicion.value) {
      anterior.value = await reservasService.obtener(props.id)
      const a = anterior.value
      Object.assign(form, {
        regaloId: String(a.regaloId),
        cliente: a.cliente,
        telefono: a.telefono,
        fechaRecojo: a.fechaRecojo,
        cantidad: a.cantidad,
        dedicatoria: a.dedicatoria || '',
        estado: a.estado,
      })
    }
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  errores.value = validarReserva(form, { stockDisponible: stockDisponible.value, exigirFechaFutura: !esEdicion.value })
  if (!form.regaloId) errores.value.regaloId = 'Selecciona un regalo.'
  if (Object.keys(errores.value).length) return

  guardando.value = true
  error.value = ''
  const datos = {
    regaloId: Number(form.regaloId),
    cliente: form.cliente.trim(),
    telefono: form.telefono.trim(),
    fechaRecojo: form.fechaRecojo,
    cantidad: Number(form.cantidad),
    dedicatoria: form.dedicatoria.trim(),
    estado: form.estado,
  }
  try {
    if (esEdicion.value) await reservasService.actualizar(props.id, datos)
    else await reservasService.crear(datos)
    router.push({ name: 'reservas' })
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <EncabezadoPagina :titulo="esEdicion ? `Editar reserva #${id}` : 'Nueva reserva'" />

  <p v-if="cargando" class="text-gray-500">Cargando…</p>
  <form v-else class="card max-w-2xl space-y-4 p-6" novalidate @submit.prevent="guardar">
    <p v-if="error" class="alerta-error">{{ error }}</p>

    <CampoForm
      label="Regalo"
      para="regaloId"
      :error="errores.regaloId"
      :ayuda="stockDisponible !== null ? `Disponible para esta reserva: ${stockDisponible}` : ''"
      requerido
    >
      <select id="regaloId" v-model="form.regaloId" class="input" :class="{ 'input-error': errores.regaloId }">
        <option value="" disabled>Selecciona un regalo</option>
        <option v-for="r in regalos" :key="r.id" :value="String(r.id)">
          {{ r.nombre }} — {{ moneda(r.precio) }} (stock: {{ r.stock }})
        </option>
      </select>
    </CampoForm>

    <div class="grid gap-4 sm:grid-cols-2">
      <CampoForm label="Cliente" para="cliente" :error="errores.cliente" requerido>
        <input id="cliente" v-model="form.cliente" class="input" :class="{ 'input-error': errores.cliente }" />
      </CampoForm>
      <CampoForm label="Teléfono" para="telefono" :error="errores.telefono" requerido>
        <input id="telefono" v-model="form.telefono" type="tel" class="input" :class="{ 'input-error': errores.telefono }" />
      </CampoForm>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <CampoForm label="Fecha de recojo" para="fechaRecojo" :error="errores.fechaRecojo" requerido>
        <input id="fechaRecojo" v-model="form.fechaRecojo" type="date" class="input" :class="{ 'input-error': errores.fechaRecojo }" />
      </CampoForm>
      <CampoForm label="Cantidad" para="cantidad" :error="errores.cantidad" requerido>
        <input id="cantidad" v-model.number="form.cantidad" type="number" min="1" class="input" :class="{ 'input-error': errores.cantidad }" />
      </CampoForm>
      <CampoForm label="Estado" para="estado" requerido>
        <select id="estado" v-model="form.estado" class="input">
          <option v-for="e in ESTADOS" :key="e.valor" :value="e.valor">{{ e.texto }}</option>
        </select>
      </CampoForm>
    </div>

    <CampoForm label="Dedicatoria" para="dedicatoria" :error="errores.dedicatoria" :ayuda="`${form.dedicatoria.length}/200 caracteres`">
      <textarea id="dedicatoria" v-model="form.dedicatoria" rows="2" maxlength="200" class="input"></textarea>
    </CampoForm>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
      <p class="text-sm text-gray-600">Total: <span class="text-lg font-bold text-rose-600">{{ moneda(total) }}</span></p>
      <div class="flex gap-2">
        <RouterLink :to="{ name: 'reservas' }" class="btn btn-secundario">Cancelar</RouterLink>
        <button type="submit" class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Guardando…' : 'Guardar' }}</button>
      </div>
    </div>
  </form>
</template>
