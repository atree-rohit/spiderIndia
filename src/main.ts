import { createApp } from 'vue'
import './style.css'
import store from './store/index'
import App from './App.vue'
import treeNode from './components/treeNode.vue'

const app = createApp(App)

app.component('treeNode', treeNode)

app.use(store)

app.mount('#app')
