import { createStore } from 'vuex'
import * as d3 from 'd3'

export default createStore({
    state: {
        inat_data: [],
        taxa_tree: [],
        selected_taxa: "",
        filtered_data: [],
        family_data: []
    },
    mutations: {
        SET_DATA(state, data) {
            state.inat_data = data
        },

        SET_FAMILY_DATA(state, data) {
            state.family_data = data
        },
        
        SET_TAXA_TREE(state) {
            state.taxa_tree = makeTree(state.filtered_data)
        },

        SET_SELECTED_TAXA(state, taxa) {
            state.selected_taxa = taxa
        },

        SET_FILTERED_DATA(state) {
            state.filtered_data = []
            if(state.selected_taxa === "") {
                state.filtered_data = state.inat_data
            } else {
                state.filtered_data = state.inat_data.filter(d => state.inat_data.filter(taxon => 
                    (taxon.taxon_class == state.selected_taxa) ||
                    (taxon.taxon_order == state.selected_taxa) ||
                    (taxon.taxon_family == state.selected_taxa) ||
                    (taxon.taxon_genus == state.selected_taxa) ||
                    (taxon.taxon_species == state.selected_taxa)
                ))
            }
        }


    },
    actions: {
        async loadDataFromJson({ commit }) {
            const response_inat = await fetch('/data/all_india_spiders_05Mar2023.json')
            const data_inat = await response_inat.json()
            commit('SET_DATA', data_inat)
            const response_families = await fetch('/data/families.json')
            const data_families = await response_families.json()
            commit('SET_FAMILY_DATA', data_families)
            commit('SET_FILTERED_DATA')
            commit('SET_TAXA_TREE')
        },
        selectTaxa({ commit }, taxa) {
            commit('SET_SELECTED_TAXA', taxa)
            commit('SET_FILTERED_DATA')
            commit('SET_TAXA_TREE')
        }
    },
    modules: {}
})

function makeTree(data) {
    let complete_tree = d3.rollups(data, v => v.length, d => d["taxon_class"], d=> d["taxon_order"], d=> d["taxon_family"], d=> d["taxon_genus"], d=> d["taxon_species"])
    return convertArrayToObject(pruneTree(complete_tree))
    
}
function pruneTree(node) {
    if (node.children && node.children.length > 0) {
      node.children = node.children.map(child => pruneTree(child)).filter(Boolean)
      const allChildrenHaveNoName = node.children.every(child => !child.name || child.name.trim() === '')
      if (allChildrenHaveNoName && (!node.name || node.name.trim() === '')) {
        return null
      }
    }
    return node
}

function convertArrayToObject(arr) {
    const result = []
    arr.forEach(([name, children]) => {
      const obj = { name }
      if (children && children.length) {
        obj.children = convertArrayToObject(children)
      }
      result.push(obj)
    })
    return result
  }
  
  