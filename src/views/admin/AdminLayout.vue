<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const secciones = [
  { ruta: '/admin', nombre: 'admin', texto: 'Resumen', icono: '📊' },
  { ruta: '/admin/ocasiones', nombre: 'ocasiones', texto: 'Ocasiones', icono: '🎈' },
  { ruta: '/admin/regalos', nombre: 'regalos', texto: 'Regalos', icono: '🎁' },
  { ruta: '/admin/reservas', nombre: 'reservas', texto: 'Reservas', icono: '📅' },
]

// Resalta la sección también en sus subrutas (nuevo / editar)
function activa(s) {
  return s.nombre === 'admin' ? route.name === 'admin' : route.path.startsWith(s.ruta)
}
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
    <aside class="md:w-52 md:shrink-0">
      <p class="mb-2 hidden px-3 text-xs font-semibold tracking-wide text-gray-400 uppercase md:block">Administración</p>
      <nav class="flex gap-1 overflow-x-auto md:flex-col">
        <RouterLink
          v-for="s in secciones"
          :key="s.nombre"
          :to="{ name: s.nombre }"
          class="enlace flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          :class="{ 'enlace-activo': activa(s) }"
        >
          <span aria-hidden="true">{{ s.icono }}</span>{{ s.texto }}
        </RouterLink>
      </nav>
    </aside>

    <section class="min-w-0 flex-1">
      <RouterView :key="route.fullPath" />
    </section>
  </div>
</template>
