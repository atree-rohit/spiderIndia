<style scoped>
    .species-list-container{
        width: 98%;
        border: 1px dashed green;
        text-align: center;
        max-height: 15vh;
        overflow-y: scroll;
        overflow-x: hidden;
    }
    .species-list-container input{
        margin: 0.25rem;
        width: 99%;
    }
    
    .species-list-container .species-list{
        display:flex;
        flex-wrap: wrap;
    }
    .species-list-container .species-list span{
        border: 1px solid red;
        border-radius: 25px;
        padding: .25rem 0.5rem;
        margin: 0.25rem;
    }
    .species-list-container .species-list span:hover{
        background-color: red;
        color:white;
        cursor: pointer;
    }
</style>
<template>
    <div class="species-list-container">
        <input v-model="search_text">
        <div class="species-list">
            <span v-for="taxa in filtered_taxa_names" :key="taxa" v-text="taxa" @click="select_taxa(taxa)"/>
        </div>
    </div>
  </template>
  <script lang="ts">
  import * as d3 from "d3";
  import { mapState } from 'vuex'
  import store from '../store/index'
  export default {
    name: "speciesList",
    data(){
        return {
            search_text: '',
            taxa_names: []
        }
    },
    watch:{
        taxa_tree(newVal){
            this.taxa_names = this.get_taxa_names(newVal).sort()
        }
    },
    computed:{
        ...mapState(['taxa_tree']),
        filtered_taxa_names(){
            return this.taxa_names.filter((item)=>{
                return item.toLowerCase().includes(this.search_text.toLowerCase())
            })
        }
    },
    methods: {
        get_taxa_names(obj){
            let op = []
            if(Array.isArray(obj)){
                obj.forEach((item)=>{
                    if(item.name){
                        op.push(item.name)
                    }
                    if(item.children){
                        op = op.concat(this.get_taxa_names(item.children))
                    }
                })
            } 
            return op
        },
        select_taxa(taxa){
            if(this.search_text == taxa){
                this.search_text = ''
            } else {
                this.search_text = taxa
            }
            store.dispatch('selectTaxa', this.search_text)
        }
    }
  }
</script>
  