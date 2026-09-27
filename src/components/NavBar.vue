<script setup>
import { useRoute, useRouter } from 'vue-router'
import { sesion } from '@/stores/sesion'
import { NOMBRE_TIENDA } from '@/config'

const route = useRoute()
const router = useRouter()

function salir() {
  sesion.cerrar()
  if (route.matched.some((r) => r.meta.requiereAuth)) router.push({ name: 'inicio' })
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-rose-100 bg-white/90 backdrop-blur">
    <nav class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
      <RouterLink to="/" class="flex items-center gap-2 text-xl font-extrabold tracking-tight text-rose-600">
        <span aria-hidden="true">🎁</span>{{ NOMBRE_TIENDA }}
      </RouterLink>

      <div class="flex flex-wrap items-center gap-1 text-sm font-medium">
        <RouterLink to="/" class="enlace" exact-active-class="enlace-activo">Inicio</RouterLink>
        <RouterLink to="/catalogo" class="enlace" active-class="enlace-activo">Catálogo</RouterLink>
        <template v-if="sesion.autenticado">
          <RouterLink to="/admin" class="enlace" active-class="enlace-activo">Administración</RouterLink>
          <span class="hidden px-2 text-xs text-gray-400 md:inline">{{ sesion.usuario.nombre }}</span>
          <button type="button" class="btn btn-secundario btn-chico ml-1" @click="salir">Cerrar sesión</button>
        </template>
        <RouterLink v-else to="/login" class="btn btn-primario btn-chico ml-1">Iniciar sesión</RouterLink>
      </div>
    </nav>
  </header>
</template>
