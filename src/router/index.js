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
      name: 'home',
      component: Home,
    },
    {
      path: '/avatars',
      name: 'avatars',
      component: AvatarList,
    },
    {
      path: '/weapons',
      name: 'weapons',
      component: WeaponList,
    },
    {
      path: '/artifacts',
      name: 'artifacts',
      component: ArtifactList,
    },
    {
      path: '/banners',
      name: 'banners',
      component: BannerList,
    },
    {
      path: '/formulae',
      name: 'formulae',
      component: Formulae,
    },
    {
      path: '/avatars/:avatarName',
      name: 'avatarPage',
      component: () => import('@/views/AvatarDetailView.vue'),
    },
    {
      path: '/weapons/:weaponName',
      name: 'weaponPage',
      component: () => import('@/views/WeaponDetailView.vue'),
    },
    {
      path: '/artifacts/:artifactName',
      name: 'artifactPage',
      component: () => import('@/views/ArtifactDetailView.vue'),
    },
  ],
})

export default router
