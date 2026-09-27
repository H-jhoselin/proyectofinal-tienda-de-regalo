import { createRouter, createWebHistory } from 'vue-router'
import { sesion } from '@/stores/sesion'
import { NOMBRE_TIENDA } from '@/config'

import HomeView from '@/views/HomeView.vue'
import CatalogoView from '@/views/CatalogoView.vue'
import ReservarView from '@/views/ReservarView.vue'
import LoginView from '@/views/LoginView.vue'

const routes = [
  // ---------- Rutas públicas ----------
  { path: '/', name: 'inicio', component: HomeView, meta: { titulo: 'Inicio' } },
  { path: '/catalogo', name: 'catalogo', component: CatalogoView, meta: { titulo: 'Catálogo' } },
  { path: '/reservar/:id', name: 'reservar', component: ReservarView, props: true, meta: { titulo: 'Reservar' } },
  { path: '/login', name: 'login', component: LoginView, meta: { titulo: 'Iniciar sesión', soloInvitados: true } },

  // ---------- Rutas protegidas (requieren autenticación) ----------
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiereAuth: true },
    children: [
      { path: '', name: 'admin', component: () => import('@/views/admin/AdminResumen.vue'), meta: { titulo: 'Resumen' } },

      { path: 'ocasiones', name: 'ocasiones', component: () => import('@/views/admin/OcasionesList.vue'), meta: { titulo: 'Ocasiones' } },
      { path: 'ocasiones/nueva', name: 'ocasion-nueva', component: () => import('@/views/admin/OcasionForm.vue'), meta: { titulo: 'Nueva ocasión' } },
      { path: 'ocasiones/:id/editar', name: 'ocasion-editar', component: () => import('@/views/admin/OcasionForm.vue'), props: true, meta: { titulo: 'Editar ocasión' } },

      { path: 'regalos', name: 'regalos', component: () => import('@/views/admin/RegalosList.vue'), meta: { titulo: 'Regalos' } },
      { path: 'regalos/nuevo', name: 'regalo-nuevo', component: () => import('@/views/admin/RegaloForm.vue'), meta: { titulo: 'Nuevo regalo' } },
      { path: 'regalos/:id/editar', name: 'regalo-editar', component: () => import('@/views/admin/RegaloForm.vue'), props: true, meta: { titulo: 'Editar regalo' } },

      { path: 'reservas', name: 'reservas', component: () => import('@/views/admin/ReservasList.vue'), meta: { titulo: 'Reservas' } },
      { path: 'reservas/nueva', name: 'reserva-nueva', component: () => import('@/views/admin/ReservaForm.vue'), meta: { titulo: 'Nueva reserva' } },
      { path: 'reservas/:id/editar', name: 'reserva-editar', component: () => import('@/views/admin/ReservaForm.vue'), props: true, meta: { titulo: 'Editar reserva' } },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Guard de navegación: protege las rutas con meta.requiereAuth
router.beforeEach((to) => {
  if (to.matched.some((r) => r.meta.requiereAuth) && !sesion.autenticado) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.soloInvitados && sesion.autenticado) {
    return { name: 'admin' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.titulo ? `${to.meta.titulo} · ${NOMBRE_TIENDA}` : NOMBRE_TIENDA
})

export default router
