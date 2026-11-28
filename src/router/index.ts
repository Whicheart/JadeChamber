import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', redirect: '/avatars' },
        {
          path: 'avatars',
          name: 'avatars',
          component: () => import('../views/AvatarListView.vue'),
        },
        {
          path: 'weapons',
          name: 'weapons',
          component: () => import('../views/WeaponListView.vue'),
        },
        {
          path: 'reliquaries',
          name: 'reliquaries',
          component: () => import('../views/ReliquaryListView.vue'),
        },
        {
          path: 'monsters',
          name: 'monsters',
          component: () => import('../views/MonsterListView.vue'),
        },
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: () => import('../views/NotFoundView.vue'),
        },
      ],
    },
  ],
})

export default router
