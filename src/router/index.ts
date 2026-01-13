import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Homepage',
    component: () => import('@/views/Homepage.vue')
  },
  {
    path: '/play',
    name: 'Game',
    component: () => import('@/views/Game.vue')
  },
  {
    path: '/rejoin',
    name: 'Rejoin',
    component: () => import('@/views/Rejoin.vue')
  },
  {
    path: '/room-closed',
    name: 'RoomClosed',
    component: () => import('@/views/RoomClosed.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Error',
    component: () => import('@/views/Error.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
