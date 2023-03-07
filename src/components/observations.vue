<style scoped>
    .main-container{
        display: grid;
        grid-template-rows: 5vh 20vh 65vh;
        border: 1px solid red;
        height: 100%;
    }
    h3{
        font-size: 1.5rem;
        font-weight: bold;
        color: #333;
        /* background-color: yellow; */
        padding: 0.5rem;
        margin: 0;
    }
    
    .controls{
      display: flex;
      border: 1px solid red;
      gap: 0.5rem;
    }
    .controls > *{
      flex: 1 1 0;
      border: 1px solid green;
    }
    .controls .zoom{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size:1.25rem;
    }
    .controls .id-level{
      display:flex;
      flex-wrap: wrap;
      align-content: center;
      justify-content: center;
    }
    .controls .id-level button{
      flex: 1 1 0;      
      border: 1px dotted #ccc;
      /* padding: 0.5rem; */
      height: 1.5rem;
      background-color: #f99;
    }

    .controls .id-level button.selected{
      background-color: #9f9;
    }
    .controls .id-level button:hover{
      background-color: #ccc;
      cursor: pointer;
    }
    .species-tree{
      overflow-y: scroll;
      max-height: 20vh;
    }
</style>

<template>
    <div class="main-container">
        <h3>Spider India</h3>
        <div class="controls">
          <species-tree :node="tree_data" class="species-tree"/>
          <div class="zoom">
            Hexagon Size {{ h3_zoom  }}
            <input class="slider" type="range" name="amountRange" min="0" max="8" v-model="h3_zoom" />
          </div>
          <div class="id-level">
            <button
              v-for="level in id_levels"
              :key="level"
              v-text="level"
              :class="idLevelBtnClass(level)"
              @click="selectIdLevel(level)"
            />
          </div>
        </div>
        <div id="map">
            <h3-map :h3_zoom="parseInt(h3_zoom)"/>
        </div>
    </div>
</template>

<script lang="ts">
  import { mapState } from 'vuex'
  import store from '../store/index'
  
  import speciesTree from './speciesTree.vue'
  import h3Map from './h3Map.vue'
  export default {
    name: 'App',
    components: {
      speciesTree,
      h3Map
    },
    data(){
      return {
        h3_zoom: 3,
        id_levels: ["class", "order", "superfamily", "family", "subfamily", "tribe", "genus", "species"],
        selected_id_level: "order"
      }
    },
    mounted() {
    },
    computed: {
      ...mapState(['taxa_tree']),
      tree_data(){
        if(this.taxa_tree.length == 0){
          return {name: "", children: []}
        }
        return this.taxa_tree[0]
      }
    },
    methods:{
      idLevelBtnClass(level){
        let index_current = this.id_levels.indexOf(this.selected_id_level)
        let index = this.id_levels.indexOf(level)
        return index >= index_current ? "selected" : ""
      },
      selectIdLevel(level){
        this.selected_id_level =level
        store.dispatch('selectIdLevel', level)
      }
    }
  }
</script>