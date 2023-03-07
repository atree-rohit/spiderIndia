import { createStore } from 'vuex'
import * as d3 from 'd3'

export default createStore({
    state: {
        inat_data: [],
        taxa_tree: [],
        selected_taxa: "",
        filtered_data: [],
        family_data: [],
        id_level: "class"
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
            console.log("SET_SELECTED_TAXA", taxa)
            state.selected_taxa = taxa
        },

        SET_FILTERED_DATA(state) {
            console.log("SET_FILTERED_DATA", state.selected_taxa)
            state.filtered_data = []
            if(state.selected_taxa === "") {
                state.filtered_data = state.inat_data
            } else {
                state.filtered_data = state.inat_data.filter(d => 
                    {
                        return ((d.taxon_class == state.selected_taxa) ||
                        (d.taxon_order == state.selected_taxa) ||
                        (d.taxon_family == state.selected_taxa) ||
                        (d.taxon_genus == state.selected_taxa) ||
                        (d.taxon_species == state.selected_taxa))
                    }
                )
            }
            if(state.id_level != "class"){
                state.filtered_data = state.filtered_data.filter(d => d[`taxon_${state.id_level}`] != "")
            }
        },

        SET_ID_LEVEL(state, id_level) {
            state.id_level = id_level
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
            console.log("selectTaxa",taxa)
            commit('SET_SELECTED_TAXA', taxa)
            commit('SET_FILTERED_DATA')
            // commit('SET_TAXA_TREE')
        },
        selectIdLevel({ commit }, id_level) {
            console.log("selectIdLevel",id_level)
            commit('SET_ID_LEVEL', id_level)
            commit('SET_FILTERED_DATA')
            commit('SET_TAXA_TREE')
        }
    },
    modules: {}
})

function makeTree(data) {
    let complete_tree = d3.groups(data, d => d["taxon_class"], d=> d["taxon_order"], d=> d["taxon_family"], d=> d["taxon_genus"], d=> d["taxon_species"])
    let x = pruneTree(complete_tree)
    let y = convertArrayToObject(x)
    let z = addDescendantsCount(y)    
    return z
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
    const result = [];
    arr.forEach(([groupKey, groupData]) => {
      if (Array.isArray(groupData[0])) {
        // Nested groups, recurse
        const nested = convertArrayToObject(groupData);
        const obj = {
          name: groupKey,
          children: nested,
          descendants: nested.reduce((acc, child) => acc + child.descendants + 1, 0),
          observations: nested.reduce((acc, child) => acc + child.observations, 0)
        };
        result.push(obj);
      } else {
        // Leaf node
        // console.log(groupKey, groupData)
        const obj = {
          name: groupKey,
          descendants: 0,
          observations: groupData.length
        };
        result.push(obj);
      }
    });
    return result;
  }
  
  
  
  

  function addDescendantsCount(node) {
    if (!node.children) {
      // Leaf nodes have no children, 0 descendants, and 0 observations
      node.descendants = 0;
      node.observations = 0;
    } else {
      // Recursively compute number of descendants and sum of observations for each child
      node.descendants = 0;
      node.observations = 0;
      for (let child of node.children) {
        addDescendantsCount(child);
        node.descendants += child.descendants + 1;
        node.observations += child.observations;
      }
    }
    // Add own observations to sum
    node.observations += node[0];
    return node;
}

