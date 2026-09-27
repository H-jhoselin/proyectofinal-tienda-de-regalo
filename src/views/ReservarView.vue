<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { regalosService } from '@/services/regalos'
import { ocasionesService } from '@/services/ocasiones'
import { reservasService } from '@/services/reservas'
import RegaloImagen from '@/components/RegaloImagen.vue'
import CampoForm from '@/components/CampoForm.vue'
import { moneda, fecha, hoyISO, mensajeError } from '@/utils/formato'
import { validarReserva } from '@/utils/validaciones'

const props = defineProps({ id: { type: String, required: true } })

const regalo = ref(null)
const ocasion = ref(null)
const cargando = ref(true)
const error = ref('')
const enviando = ref(false)
const reservaCreada = ref(null)

const form = reactive({ cliente: '', telefono: '', fechaRecojo: '', cantidad: 1, dedicatoria: '' })
const errores = ref({})

const total = computed(() => (regalo.value ? regalo.value.precio * (Number(form.cantidad) || 0) : 0))

onMounted(async () => {
  try {
    regalo.value = await regalosService.obtener(props.id)
    ocasion.value = await ocasionesService.obtener(regalo.value.ocasionId).catch(() => null)
  } catch (e) {
    error.value = e?.response?.status === 404 ? 'El regalo que buscas no existe.' : mensajeError(e)
  } finally {
    cargando.value = false
  }
})

async function enviar() {
  errores.value = validarReserva(form, { stockDisponible: regalo.value.stock })
  if (Object.keys(errores.value).length) return

  enviando.value = true
  error.value = ''
  try {
    reservaCreada.value = await reservasService.crear({
      cliente: form.cliente.trim(),
      telefono: form.telefono.trim(),
      fechaRecojo: form.fechaRecojo,
      cantidad: Number(form.cantidad),
      dedicatoria: form.dedicatoria.trim(),
      estado: 'pendiente',
      regaloId: regalo.value.id,
    })
  } catch (e) {
    error.value = mensajeError(e)
    // El stock pudo cambiar mientras se llenaba el formulario
    regalo.value = await regalosService.obtener(props.id).catch(() => regalo.value)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10">
    <RouterLink to="/catalogo" class="text-sm font-medium text-rose-600 hover:underline">← Volver al catálogo</RouterLink>

    <p v-if="cargando" class="mt-10 text-center text-gray-500">Cargando…</p>
    <p v-else-if="!regalo" class="alerta-error mt-6">{{ error }}</p>

    <!-- Confirmación -->
    <div v-else-if="reservaCreada" class="card mx-auto mt-6 max-w-lg p-8 text-center">
      <p class="text-5xl">🎉</p>
      <h1 class="mt-3 text-2xl font-bold text-gray-900">¡Reserva registrada!</h1>
      <p class="mt-2 text-gray-600">
        Tu código de reserva es <strong class="text-rose-600">#{{ reservaCreada.id }}</strong>.
      </p>
      <dl class="mt-6 space-y-2 rounded-xl bg-rose-50 p-4 text-left text-sm">
        <div class="flex justify-between"><dt class="text-gray-500">Regalo</dt><dd class="font-medium">{{ regalo.nombre }}</dd></div>
        <div class="flex justify-between"><dt class="text-gray-500">Cantidad</dt><dd class="font-medium">{{ reservaCreada.cantidad }}</dd></div>
        <div class="flex justify-between"><dt class="text-gray-500">Fecha de recojo</dt><dd class="font-medium">{{ fecha(reservaCreada.fechaRecojo) }}</dd></div>
        <div class="flex justify-between"><dt class="text-gray-500">Total a pagar</dt><dd class="font-bold text-rose-600">{{ moneda(regalo.precio * reservaCreada.cantidad) }}</dd></div>
      </dl>
      <p class="mt-4 text-xs text-gray-500">Te contactaremos al {{ reservaCreada.telefono }} para confirmar tu reserva.</p>
      <RouterLink to="/catalogo" class="btn btn-primario mt-6">Seguir viendo regalos</RouterLink>
    </div>

    <div v-else class="mt-6 grid gap-6 md:grid-cols-5">
      <!-- Resumen del regalo -->
      <aside class="card overflow-hidden md:col-span-2 md:self-start">
        <RegaloImagen :src="regalo.imagen" :alt="regalo.nombre" :icono="ocasion?.icono" class="h-56" />
        <div class="space-y-2 p-5">
          <span v-if="ocasion" class="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">{{ ocasion.icono }} {{ ocasion.nombre }}</span>
          <h1 class="text-xl font-bold text-gray-900">{{ regalo.nombre }}</h1>
          <p class="text-sm text-gray-500">{{ regalo.descripcion }}</p>
          <p class="text-2xl font-bold text-rose-600">{{ moneda(regalo.precio) }}</p>
          <p class="text-xs" :class="regalo.stock > 0 ? 'text-gray-500' : 'font-medium text-red-600'">
            {{ regalo.stock > 0 ? `${regalo.stock} unidad(es) disponible(s)` : 'Agotado' }}
          </p>
        </div>
      </aside>

      <!-- Formulario de reserva -->
      <form class="card space-y-4 p-6 md:col-span-3" novalidate @submit.prevent="enviar">
        <h2 class="text-lg font-semibold text-gray-900">Datos de la reserva</h2>
        <p v-if="error" class="alerta-error">{{ error }}</p>
        <p v-if="regalo.stock === 0" class="alerta-error">Este regalo está agotado por el momento.</p>

        <CampoForm label="Nombre completo" para="cliente" :error="errores.cliente" requerido>
          <input id="cliente" v-model="form.cliente" class="input" :class="{ 'input-error': errores.cliente }" autocomplete="name" />
        </CampoForm>

        <div class="grid gap-4 sm:grid-cols-2">
          <CampoForm label="Teléfono / celular" para="telefono" :error="errores.telefono" requerido>
            <input id="telefono" v-model="form.telefono" type="tel" class="input" :class="{ 'input-error': errores.telefono }" autocomplete="tel" />
          </CampoForm>
          <CampoForm label="Fecha de recojo" para="fechaRecojo" :error="errores.fechaRecojo" requerido>
            <input id="fechaRecojo" v-model="form.fechaRecojo" type="date" :min="hoyISO()" class="input" :class="{ 'input-error': errores.fechaRecojo }" />
          </CampoForm>
        </div>

        <CampoForm label="Cantidad" para="cantidad" :error="errores.cantidad" requerido>
          <input id="cantidad" v-model.number="form.cantidad" type="number" min="1" :max="regalo.stock" class="input sm:w-32" :class="{ 'input-error': errores.cantidad }" />
        </CampoForm>

        <CampoForm label="Dedicatoria (opcional)" para="dedicatoria" :error="errores.dedicatoria" :ayuda="`${form.dedicatoria.length}/200 caracteres`">
          <textarea id="dedicatoria" v-model="form.dedicatoria" rows="3" maxlength="200" class="input" placeholder="Escribe un mensaje para la tarjeta…"></textarea>
        </CampoForm>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <p class="text-sm text-gray-600">Total: <span class="text-xl font-bold text-rose-600">{{ moneda(total) }}</span></p>
          <button type="submit" class="btn btn-primario" :disabled="enviando || regalo.stock === 0">
            {{ enviando ? 'Reservando…' : 'Confirmar reserva' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
