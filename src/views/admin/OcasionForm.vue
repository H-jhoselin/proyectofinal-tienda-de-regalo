<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ocasionesService } from '@/services/ocasiones'
import EncabezadoPagina from '@/components/EncabezadoPagina.vue'
import CampoForm from '@/components/CampoForm.vue'
import { mensajeError } from '@/utils/formato'
import { validarOcasion } from '@/utils/validaciones'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()

const esEdicion = computed(() => !!props.id)
const iconosSugeridos = ['🎂', '💘', '💐', '🎄', '💍', '🎓', '👶', '👨', '🐣', '🎃', '🏆', '🙏', '🎈', '🌸']

const form = reactive({ nombre: '', icono: '🎁', descripcion: '' })
const errores = ref({})
const error = ref('')
const cargando = ref(false)
const guardando = ref(false)

onMounted(async () => {
  if (!esEdicion.value) return
  cargando.value = true
  try {
    const o = await ocasionesService.obtener(props.id)
    Object.assign(form, { nombre: o.nombre, icono: o.icono || '🎁', descripcion: o.descripcion || '' })
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  errores.value = validarOcasion(form)
  if (Object.keys(errores.value).length) return

  guardando.value = true
  error.value = ''
  const datos = { nombre: form.nombre.trim(), icono: form.icono.trim(), descripcion: form.descripcion.trim() }
  try {
    if (esEdicion.value) await ocasionesService.actualizar(props.id, datos)
    else await ocasionesService.crear(datos)
    router.push({ name: 'ocasiones' })
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <EncabezadoPagina :titulo="esEdicion ? 'Editar ocasión' : 'Nueva ocasión'" />

  <p v-if="cargando" class="text-gray-500">Cargando…</p>
  <form v-else class="card max-w-xl space-y-4 p-6" novalidate @submit.prevent="guardar">
    <p v-if="error" class="alerta-error">{{ error }}</p>

    <CampoForm label="Nombre" para="nombre" :error="errores.nombre" requerido>
      <input id="nombre" v-model="form.nombre" class="input" :class="{ 'input-error': errores.nombre }" placeholder="Ej.: Día del Padre" />
    </CampoForm>

    <CampoForm label="Ícono" para="icono" :error="errores.icono" ayuda="Escribe un emoji o elige uno de la lista." requerido>
      <div class="flex flex-wrap items-center gap-2">
        <input id="icono" v-model="form.icono" maxlength="4" class="input w-20 text-center text-xl" :class="{ 'input-error': errores.icono }" />
        <button
          v-for="i in iconosSugeridos"
          :key="i"
          type="button"
          class="h-9 w-9 cursor-pointer rounded-lg text-xl hover:bg-rose-50"
          :class="{ 'bg-rose-100 ring-2 ring-rose-400': form.icono === i }"
          @click="form.icono = i"
        >
          {{ i }}
        </button>
      </div>
    </CampoForm>

    <CampoForm label="Descripción" para="descripcion" :error="errores.descripcion" :ayuda="`${form.descripcion.length}/150 caracteres`">
      <textarea id="descripcion" v-model="form.descripcion" rows="3" maxlength="150" class="input"></textarea>
    </CampoForm>

    <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
      <RouterLink :to="{ name: 'ocasiones' }" class="btn btn-secundario">Cancelar</RouterLink>
      <button type="submit" class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Guardando…' : 'Guardar' }}</button>
    </div>
  </form>
</template>
