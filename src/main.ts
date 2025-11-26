
import './assets/main.css'
import "flag-icons/css/flag-icons.min.css"

import { createApp } from 'vue'
import { createPinia } from 'pinia'  
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import 'vue-sonner/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)  
app.use(router)
app.use(i18n)
app.use(pinia)

app.mount('#app')

