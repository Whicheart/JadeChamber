import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/HomeView.vue'
import AvatarList from '@/views/AvatarListView.vue'
import WeaponList from '@/views/WeaponListView.vue'
import ArtifactList from '@/views/ArtifactListView.vue'
import BannerList from '@/views/BannerListView.vue'
import Formulae from '@/views/FormulaeView.vue'

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
      path: '/weapons',
      component: WeaponList,
    },
    {
      path: '/artifacts',
      component: ArtifactList,
    },
    {
      path: '/banners',
      component: BannerList,
    },
    {
      path: '/formulae',
      component: Formulae,
    },
    {
      path: '/avatar/:avatarId',
      component: () => import('@/views/AvatarDetailView.vue'),
    },
    {
      path: '/weapons/:weaponName',
      component: () => import('@/views/WeaponDetailView.vue'),
    },
    {
      path: '/artifacts/:artifactName',
      component: () => import('@/views/ArtifactDetailView.vue'),
    },
  ],
})

export default router
