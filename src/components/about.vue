<style scoped>
    .about-container{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        border: 1px solid red;
        height: 100%;
        grid-gap: 2px;
    }
</style>

<template>
    <div class="about-container">
        <div
            class="card"
            v-for="level in taxon_fields"
            :key="level"
        >
            <about-card :level="level.replace('taxon_', '')" :stats="stats[level.replace('taxon_', '')]"></about-card>

        </div>
            

    </div>
</template>

<script>
import { mapState } from 'vuex'
import * as d3 from 'd3'

import aboutCard from './aboutCard.vue'
export default {
    name: 'About',
    components: {
        aboutCard
    },
    data(){
        return {
            taxon_fields: [
                "taxon_class",
                "taxon_order",
                "taxon_suborder",
                "taxon_superfamily",
                "taxon_family",
                "taxon_subfamily",
                "taxon_tribe",
                "taxon_subtribe",
                "taxon_genus",
                "taxon_species",
                "taxon_subspecies"
            ],
            stats: {}
        }
    },
    computed: {
        ...mapState(['inat_data']),
    },
    created() {
        console.clear()
        this.init1()        
    },
    
    watch:{
        inat_data(){
            this.init1()
        }
    },
    methods:{
        init0(){
            let names = [...new Set(this.inat_data.map((o) => o.scientific_name))].slice(1,1000);
            let op = {};
            let taxonomicFields = new Set(this.taxon_fields);
            for (let i = 0; i < names.length; i++) {
            let n = names[i];
            let level = "unknown";
            for (let record of this.inat_data) {
                if (record.scientific_name === n) {
                for (let field of taxonomicFields) {
                    if (record[field] === n) {
                    level = field.replace("taxon_", "");
                    break;
                    }
                }
                break;
                }
            }
            if (!op[level]) {
                op[level] = {};
            }
            op[level][n] = this.inat_data.filter((o) => o.scientific_name === n).length;
            }
            console.log(op);
            this.stats = op
        },
        init1(){
            const data = d3.rollups(this.inat_data, 
                v => v.length, 
                d => d.scientific_name, 
                d => {
                    for (let field of this.taxon_fields) {
                    if (d[field] === d.scientific_name) {
                        return field.replace("taxon_", "");
                    }
                    }
                    return "unknown";
                }
            );
            let op = {}
            for (let [name, levels] of data) {
                for (let [level, count] of levels) {
                    if (!op[level]) {
                        op[level] = {}
                    }
                    op[level][name] = count
                }
            }
            this.stats = op
        },
        sortedObjectKeys(key_str){
            let key = key_str.replace("taxon_", "")
            if(this.stats[key]){
                let list = this.stats[key]
                console.log(list)
                return Object.keys(list).sort(function(a,b){return list[b]-list[a]})
            }
            else{
                return {}
            }
        },
    }
}
</script>