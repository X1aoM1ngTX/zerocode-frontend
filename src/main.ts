import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// 引入全局样式
import '@/styles/variables.css'
import '@/styles/global.css'

import App from './App.vue'
import router from './router'

import '@/access/index'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)

app.mount('#app')




