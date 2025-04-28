import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './index.css'
import App from './App.vue'

// Import pages
import DataImport from './pages/DataImport.vue'
import DataDetails from './pages/DataDetails.vue'

// Create router
const routes = [
  { path: '/', redirect: '/import' },
  { path: '/import', component: DataImport },
  { path: '/details', component: DataDetails }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create the app
const app = createApp(App)

// Register plugins
app.use(createPinia())
app.use(router)

// Mount the app
app.mount('#app')