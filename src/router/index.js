import { createRouter, createWebHistory } from 'vue-router'

import Home from './HomePage.vue'
import Avatars from './Avatars.vue'
import Weapons from './Weapons.vue'
import Artifacts from './Artifacts.vue'
import Banners  from './Banners.vue'
import Formulae from './Formulae.vue'

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
      component: Avatars,
    },
    {
      path: '/weapons',
      name: 'weapons',
      component: Weapons,
    },
    {
      path: '/artifacts',
      name: 'artifacts',
      component: Artifacts,
    },
    {
      path: '/banners',
      name: 'banners',
      component: Banners,
    },
    {
      path: '/formulae',
      name: 'formulae',
      component: Formulae,
    },
    {
      path: '/avatars/:avatarName',
      name: 'avatarPage',
      component: () => import('./AvatarPage.vue'),
    },
    {
      path: '/weapons/:weaponName',
      name: 'weaponPage',
      component: () => import('./WeaponPage.vue'),
    },
    {
      path: '/artifacts/:artifactName',
      name: 'artifactPage',
      component: () => import('./ArtifactPage.vue'),
    },
  ],
})

export default router
