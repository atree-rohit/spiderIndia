<style>
    .footer-nav{
      display: flex;
      width: 100%;
      position:fixed;
      bottom: 0;
    }
    .footer-nav button{
      flex: 1 1 0;
      border: 1px dotted #999;
      text-align: center;
      margin: auto;
      padding: 0.5rem;
    }
    .footer-nav button.selected{
      background-color: #9f9;
    }
    .footer-nav button:hover{
      background-color: #ccc;
      cursor: pointer;
    }
</style>

<template>
  <about v-if="selectedNav === 'About'" />
  <observations v-else-if="selectedNav === 'Observations'" />
  <div class="footer-nav">
    <button
      v-for="nav in navFields"
      :key="nav"
      :class="{selected: nav === selectedNav}"
      @click="selectedNav = nav"
      v-text="nav"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue'
  import store from './store/index'

  import about from './components/about.vue'
  import observations from './components/observations.vue'

  export default defineComponent({
    name: 'App',
    components: {
      about,
      observations
    },
    setup() {
      const navFields = ["Home", "About", "Observations", "Users"]
      const selectedNav = ref("Observations")

      return {
        navFields,
        selectedNav
      }
    },
    mounted() {
      console.clear()
      store.dispatch('loadDataFromJson')
    },
  })
</script>
