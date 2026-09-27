<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sesion } from '@/stores/sesion'
import CampoForm from '@/components/CampoForm.vue'
import { mensajeError } from '@/utils/formato'

const route = useRoute()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const errores = ref({})
const error = ref('')
const enviando = ref(false)

async function ingresar() {
  errores.value = {}
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errores.value.email = 'Ingresa un correo válido.'
  if (!form.password) errores.value.password = 'Ingresa tu contraseña.'
  if (Object.keys(errores.value).length) return

  enviando.value = true
  error.value = ''
  try {
    await sesion.iniciar(form.email, form.password)
    router.push(route.query.redirect || { name: 'admin' })
  } catch (e) {
    error.value = mensajeError(e)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="flex justify-center px-4 py-16">
    <form class="card w-full max-w-sm space-y-4 p-8" novalidate @submit.prevent="ingresar">
      <div class="text-center">
        <p class="text-4xl">🔐</p>
        <h1 class="mt-2 text-2xl font-bold text-gray-900">Iniciar sesión</h1>
        <p class="mt-1 text-sm text-gray-500">Acceso al panel de administración</p>
      </div>

      <p v-if="route.query.redirect" class="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
        Debes iniciar sesión para acceder a esa página.
      </p>
      <p v-if="error" class="alerta-error">{{ error }}</p>

      <CampoForm label="Correo electrónico" para="email" :error="errores.email">
        <input id="email" v-model="form.email" type="email" class="input" :class="{ 'input-error': errores.email }" autocomplete="username" />
      </CampoForm>
      <CampoForm label="Contraseña" para="password" :error="errores.password">
        <input id="password" v-model="form.password" type="password" class="input" :class="{ 'input-error': errores.password }" autocomplete="current-password" />
      </CampoForm>

      <button type="submit" class="btn btn-primario w-full" :disabled="enviando">
        {{ enviando ? 'Ingresando…' : 'Ingresar' }}
      </button>

      <p class="text-center text-xs text-gray-400">Usuario de prueba: admin@parati.com / admin123</p>
    </form>
  </div>
</template>
