import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/HomeView.vue'
import AvatarList from '@/views/AvatarListView.vue'
import WeaponList from '@/views/WeaponListView.vue'
import Formulae from '@/views/FormulaeView.vue'
import ArtifactCalculator from '@/views/ArtifactCalculatorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/avatars',
      component: AvatarList,
    },
    {
      path: '/avatar/:avatarId',
      component: () => import('@/views/AvatarDetailView.vue'),
    },
    {
      path: '/weapons',
      component: WeaponList,
    },
    {
      path: '/weapon/:weaponId',
      component: () => import('@/views/WeaponDetailView.vue'),
    },
    {
      path: '/artifacts',
      component: () => import('@/views/ArtifactListView.vue'),
    },
    {
      path: '/artifact/:setId',
      component: () => import('@/views/ArtifactDetailView.vue'),
    },
    {
      path: '/arti-calc',
      component: ArtifactCalculator,
    },
    {
      path: '/formulae',
      component: Formulae,
    },
    // { path: '/banners', component: () => import('@/views/BannerListView.vue') },
  ],
})

export default router
