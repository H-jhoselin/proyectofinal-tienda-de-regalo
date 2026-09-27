<script setup>
import NavBar from '@/components/NavBar.vue'
import { NOMBRE_TIENDA } from '@/config'

const anio = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-rose-50/40 text-gray-800">
    <NavBar />
    <main class="flex-1">
      <RouterView />
    </main>
    <footer class="border-t border-rose-100 bg-white py-5 text-center text-xs text-gray-500">
      © {{ anio }} {{ NOMBRE_TIENDA }} · Regalos para cada ocasión
    </footer>
  </div>
</template>
