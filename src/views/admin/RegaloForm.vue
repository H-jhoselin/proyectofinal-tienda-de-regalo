<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { regalosService } from '@/services/regalos'
import { ocasionesService } from '@/services/ocasiones'
import EncabezadoPagina from '@/components/EncabezadoPagina.vue'
import CampoForm from '@/components/CampoForm.vue'
import RegaloImagen from '@/components/RegaloImagen.vue'
import { moneda, mensajeError } from '@/utils/formato'
import { validarRegalo } from '@/utils/validaciones'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()

const esEdicion = computed(() => !!props.id)
const ocasiones = ref([])
const form = reactive({ nombre: '', descripcion: '', precio: '', stock: '', imagen: '', ocasionId: '' })
const errores = ref({})
const error = ref('')
const cargando = ref(true)
const guardando = ref(false)

const iconoOcasion = computed(() => ocasiones.value.find((o) => String(o.id) === String(form.ocasionId))?.icono)

onMounted(async () => {
  try {
    ocasiones.value = await ocasionesService.listar()
    if (esEdicion.value) {
      const r = await regalosService.obtener(props.id)
      Object.assign(form, {
        nombre: r.nombre,
        descripcion: r.descripcion || '',
        precio: r.precio,
        stock: r.stock,
        imagen: r.imagen || '',
        ocasionId: String(r.ocasionId),
      })
    }
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  errores.value = validarRegalo(form)
  if (Object.keys(errores.value).length) return

  guardando.value = true
  error.value = ''
  const datos = {
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    precio: Number(form.precio),
    stock: Number(form.stock),
    imagen: form.imagen.trim(),
    ocasionId: Number(form.ocasionId),
  }
  try {
    if (esEdicion.value) await regalosService.actualizar(props.id, datos)
    else await regalosService.crear(datos)
    router.push({ name: 'regalos' })
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <EncabezadoPagina :titulo="esEdicion ? 'Editar regalo' : 'Nuevo regalo'" />

  <p v-if="cargando" class="text-gray-500">Cargando…</p>
  <div v-else class="grid gap-6 lg:grid-cols-3">
    <form class="card space-y-4 p-6 lg:col-span-2" novalidate @submit.prevent="guardar">
      <p v-if="error" class="alerta-error">{{ error }}</p>
      <p v-if="!ocasiones.length" class="alerta-error">
        Primero debes registrar al menos una <RouterLink :to="{ name: 'ocasion-nueva' }" class="font-semibold underline">ocasión</RouterLink>.
      </p>

      <CampoForm label="Nombre" para="nombre" :error="errores.nombre" requerido>
        <input id="nombre" v-model="form.nombre" class="input" :class="{ 'input-error': errores.nombre }" />
      </CampoForm>

      <CampoForm label="Ocasión" para="ocasionId" :error="errores.ocasionId" requerido>
        <select id="ocasionId" v-model="form.ocasionId" class="input" :class="{ 'input-error': errores.ocasionId }">
          <option value="" disabled>Selecciona una ocasión</option>
          <option v-for="o in ocasiones" :key="o.id" :value="String(o.id)">{{ o.icono }} {{ o.nombre }}</option>
        </select>
      </CampoForm>

      <div class="grid gap-4 sm:grid-cols-2">
        <CampoForm label="Precio" para="precio" :error="errores.precio" requerido>
          <input id="precio" v-model="form.precio" type="number" min="0" step="0.5" class="input" :class="{ 'input-error': errores.precio }" />
        </CampoForm>
        <CampoForm label="Stock" para="stock" :error="errores.stock" requerido>
          <input id="stock" v-model="form.stock" type="number" min="0" step="1" class="input" :class="{ 'input-error': errores.stock }" />
        </CampoForm>
      </div>

      <CampoForm label="URL de la imagen (opcional)" para="imagen" :error="errores.imagen" ayuda="Si se deja vacío se muestra el ícono de la ocasión.">
        <input id="imagen" v-model="form.imagen" type="url" class="input" :class="{ 'input-error': errores.imagen }" placeholder="https://…" />
      </CampoForm>

      <CampoForm label="Descripción" para="descripcion" :error="errores.descripcion" :ayuda="`${form.descripcion.length}/200 caracteres`">
        <textarea id="descripcion" v-model="form.descripcion" rows="3" maxlength="200" class="input"></textarea>
      </CampoForm>

      <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <RouterLink :to="{ name: 'regalos' }" class="btn btn-secundario">Cancelar</RouterLink>
        <button type="submit" class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Guardando…' : 'Guardar' }}</button>
      </div>
    </form>

    <!-- Vista previa de cómo se verá en el catálogo -->
    <aside class="lg:self-start">
      <p class="mb-2 text-sm font-medium text-gray-500">Vista previa</p>
      <div class="card overflow-hidden">
        <RegaloImagen :src="form.imagen.trim()" :alt="form.nombre" :icono="iconoOcasion" class="h-40" />
        <div class="space-y-1 p-4">
          <p class="font-semibold text-gray-900">{{ form.nombre || 'Nombre del regalo' }}</p>
          <p class="line-clamp-2 text-sm text-gray-500">{{ form.descripcion || 'Descripción del regalo' }}</p>
          <p class="font-bold text-rose-600">{{ moneda(form.precio) }}</p>
        </div>
      </div>
    </aside>
  </div>
</template>
