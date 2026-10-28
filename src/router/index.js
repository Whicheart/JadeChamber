import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/HomeView.vue'
import AvatarList from '@/views/AvatarListView.vue'
import WeaponList from '@/views/WeaponListView.vue'
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
      path: '/formulae',
      component: Formulae,
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
    // 以下页面暂未开放，视图文件保留为「待开发」模板，恢复功能时在此加回路由
    // { path: '/artifacts', component: () => import('@/views/ArtifactListView.vue') },
    // { path: '/artifacts/:artifactName', component: () => import('@/views/ArtifactDetailView.vue') },
    // { path: '/banners', component: () => import('@/views/BannerListView.vue') },
  ],
})

export default router
