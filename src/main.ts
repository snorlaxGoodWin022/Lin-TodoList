import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Import global styles
import './assets/styles/variables.css'
import './assets/styles/global.css'
import './assets/styles/animations.css'

// Create app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Mount app
app.mount('#app')

// Initialize theme
import { useAppStore } from './stores/app.store'
const appStore = useAppStore()
appStore.initTheme()