import { createApp } from 'vue'
import './style.css'
import store from './store/index'

import Unicon from 'vue-unicons'
import { uniFolderMedical, uniFolderMinus, uniStar, uniSearch, uniListOl } from 'vue-unicons/dist/icons'

import App from './App.vue'

const app = createApp(App)

Unicon.add([uniFolderMedical, uniFolderMinus, uniStar, uniSearch, uniListOl])
app.use(Unicon)

app.use(store)

app.mount('#app')
