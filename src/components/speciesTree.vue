<style scoped>
    .label {
    display: flex;
    align-items: center;
    }
    .label .unicon,
    .label span {
    padding: 0 0.25rem;
    border-radius: 15px;
    transition: all 0.25s;
    }
    .label .unicon {
    height: 32;
    }

    .label.selected {
    background: yellow;
    }

    .label:hover {
    background: #aaa;
    border-radius: 5px;
    color: white;
    }
    .label .unicon:hover,
    .label span:hover {
    cursor: pointer;
    }

    .children {
    border-left: 2px solid #aaa;
    margin-left: 1rem;
    padding-left: 1rem;
    }

    .fade-enter-active,
    .fade-leave-active {
    transition: all 0.15s;
    }
    .fade-enter,
    .fade-leave-to {
    opacity: 0;
    }
</style>

<template>
  <div>
    <div
      class="label"
      v-if="name && name.length"
      @click="toggleHideShow"
      :class="{ selected: name == selected_taxa }"
    >
      <unicon
        name="star"
        fill="darkorange"
        width="20"
        height="20"
        hover-fill="#ff0"
        v-if="children.length == 0"
      />
      <unicon
        name="folder-medical"
        fill="darkred"
        width="20"
        height="20"
        hover-fill="#ff0"
        v-else-if="!toggle"
      />
      <unicon
        name="folder-minus"
        fill="darkgreen"
        width="20"
        height="20"
        hover-fill="#ff0"
        v-else
      />
      <span @click.stop="selectName(name)">{{ name }}</span>
      ( <unicon name="search" fill="steelblue" width="12" height="12" />{{ node.observations }} | {{ node.descendants }} <unicon name="list-ol" fill="steelblue" width="12" height="12" /> )
    </div>
    <transition name="fade">
      <div class="children" v-if="toggle">
        <SpeciesTree
          v-for="child in children"
          :key="child.name"
          :node="child"
        />
      </div>
    </transition>
  </div>
</template>
  <script lang="ts">
import { ref, defineComponent, computed } from "vue"
import store from "../store/index"

export default defineComponent({
  name: "SpeciesTree",
  props: {
    node: {
      type: Object,
      default: () => ({ name: "", children: [] })
    },
  },
  setup(props) {
    const toggle = ref(false);
    const name = computed(() => props.node.name)
    const children = computed(() => props.node.children)
    const selected_taxa = computed(() => store.state.selected_taxa)

    const toggleHideShow = () => toggle.value = !toggle.value
    const selectName = (name) => store.dispatch("selectTaxa", name)

    return { toggle, name, children, selected_taxa, toggleHideShow, selectName, }
  },
})
</script> 