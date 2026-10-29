import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './css/global.css'
import './css/panel.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
