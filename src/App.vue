<style>
    .main-container{
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid red;
        width: 100%;
    }
    h3{
        font-size: 1.5rem;
        font-weight: bold;
        color: #333;
        /* background-color: yellow; */
        padding: 0.5rem;
        margin: 0;
    }
    #map{
        width: 100%;
        height: 70vh;
        /* background-color: blue; */
    }
    .species-tree{
      max-height: 40vh;
      overflow-y: scroll;
    }

</style>

<template>
    <div class="main-container">
        <h3>Spider India</h3>
        <species-tree :node="tree_data" class="species-tree"/>
        <div id="map">
            <h3-map />
        </div>
    </div>
</template>

<script lang="ts">
  import { mapActions, mapState } from 'vuex'
  import store from './store/index'
  
  import speciesList from './components/speciesList.vue'
  import speciesTree from './components/speciesTree.vue'
  import h3Map from './components/h3Map.vue'
  export default {
    name: 'App',
    components: {
      speciesList,
      speciesTree,
      h3Map
    },
    mounted() {
        console.clear()
      store.dispatch('loadDataFromJson')
    },
    computed: {
      ...mapState(['taxa_tree']),
      tree_data(){
        if(this.taxa_tree.length == 0){
          return {name: "", children: []}
        }
        return this.taxa_tree[0]
      }
    }
  }
</script>