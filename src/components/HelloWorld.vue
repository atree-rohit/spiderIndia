<style scoped>
.cards{
  display:flex;
  width: 100vw;
  color:white;
  gap: 2px;
}

.card{
  background: steelblue;
  flex: 1 1 0;
  text-align: center;
}

.card-title{
  padding: 1rem;
  font-size: 2rem;
  font-weight: bold;
}

.card-text{
  font-size: 6rem;
  border-top: 1px solid darkblue;
  padding: 1rem;
  /* font-weight: bold; */
}

#map{
  height: 80vh;
}

.species-names {
  display: flex;
  flex-wrap: wrap;
  max-height: 7.5rem;
  overflow: scroll;
}
.species-names .species-name{
  border: 1px solid red;
  padding: .25rem;
  margin: .25rem;
  border-radius: 50px;
}
</style>

<template>
  <h1>Spider India</h1>
  <!-- <div class="cards">
    <div class="card">
      <div class="card-title">Observations</div>
      <div class="card-text">{{ cleaned_data.length }}</div>
    </div>
    <div class="card">
      <div class="card-title">Users</div>
      <div class="card-text">{{Object.keys(users).length}}</div>
    </div>
    <div class="card">
      <div class="card-title">Taxa</div>
      <div class="card-text">{{ Object.keys(taxa).length }}</div>
    </div>
  </div> -->
  <div id="map">
    <input type="text" v-model="search_text">
    <div class="species-names">
      <div v-for="match in search_matches" :key="match.id" class="species-name">
        {{ match }}
      </div>

    </div>
    <h3-map :observations="cleaned_data" />
  </div>
</template>


<script lang="js">
import inat_data from "../assets/data/all_india_spiders_05Mar2023.json"
import h3Map from "./h3Map.vue"
export default{
  name: 'HelloWorld',
  components: {
    h3Map
  },
  data() {
    return {
      inat_data: inat_data,
      cleaned_data: [],
      users: {},
      taxa: {},
      taxa_fields: ["taxon_kingdom_name", "taxon_phylum_name", "taxon_subphylum_name", "taxon_superclass_name", "taxon_class_name", "taxon_subclass_name", "taxon_superorder_name", "taxon_order_name", "taxon_suborder_name", "taxon_superfamily_name", "taxon_family_name", "taxon_subfamily_name", "taxon_supertribe_name", "taxon_tribe_name", "taxon_subtribe_name", "taxon_genus_name", "taxon_genushybrid_name", "taxon_species_name", "taxon_hybrid_name", "taxon_subspecies_name", "taxon_variety_name", "taxon_form_name"],
      search_text: "",
      search_matches: [],
    }
  },
  computed:{
    headers(){
      return Object.keys(this.inat_data[0])
    },
  },
  created(){
    this.init_data(this.inat_data)
  },
  watch: {
    search_text(newVal){
      let all_species = this.inat_data.filter((o) => {
        return o.scientific_name.toLowerCase().includes(newVal.toLowerCase())
      })
      this.search_matches = [...new Set(all_species.map((o) => o.scientific_name))].sort()
      this.init_data(all_species)
    }
  },
  methods: {
    init_data(data){
      this.cleaned_data = []
      data.forEach((o) => {
        if(this.users[o.user_id] === undefined){
          this.users[o.user_id] = o.user_login
        }
        if(this.taxa[o.taxon_id] === undefined){
          let taxa_level = ""
          this.taxa_fields.forEach((t) => {
            if(o[t] == o.scientific_name){
              taxa_level = t.replace("taxon_", "").replace("_name", "")
            }
          })
          this.taxa[o.taxon_id] = {
            scientific_name: o.scientific_name,
            common_name: o.common_name,
            level: taxa_level,
            iconic_taxon_name: o.iconic_taxon_name,
            taxon_kingdom_name: o.taxon_kingdom_name,
            taxon_phylum_name: o.taxon_phylum_name,
            taxon_subphylum_name: o.taxon_subphylum_name,
            taxon_superclass_name: o.taxon_superclass_name,
            taxon_class_name: o.taxon_class_name,
            taxon_subclass_name: o.taxon_subclass_name,
            taxon_superorder_name: o.taxon_superorder_name,
            taxon_order_name: o.taxon_order_name,
            taxon_suborder_name: o.taxon_suborder_name,
            taxon_superfamily_name: o.taxon_superfamily_name,
            taxon_family_name: o.taxon_family_name,
            taxon_subfamily_name: o.taxon_subfamily_name,
            taxon_supertribe_name: o.taxon_supertribe_name,
            taxon_tribe_name: o.taxon_tribe_name,
            taxon_subtribe_name: o.taxon_subtribe_name,
            taxon_genus_name: o.taxon_genus_name,
            taxon_genushybrid_name: o.taxon_genushybrid_name,
            taxon_species_name: o.taxon_species_name,
            taxon_hybrid_name: o.taxon_hybrid_name,
            taxon_subspecies_name: o.taxon_subspecies_name,
            taxon_variety_name: o.taxon_variety_name,
            taxon_form_name: o.taxon_form_name,
          }
        }
        this.cleaned_data.push({
          id: o.id,
          observed_on: o.observed_on,
          user_id: o.user_id,
          created_at: o.created_at,
          updated_at: o.updated_at,
          latitude: o.latitude,
          longitude: o.longitude,
          taxon_id: o.taxon_id,
          taxon_species_name: o.taxon_species_name,
        })
      })
    }
  }
}
</script>