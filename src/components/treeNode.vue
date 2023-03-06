<template>
  <ul v-if="node">
    <template v-for="current_node in node" :key="current_node.name" >
      <li v-if="current_node.name">
        {{ opCurrentNode(current_node) }}
        <tree-node :node="current_node.children" v-if="current_node.children && current_node.children.length > 0" />
      </li>

    </template>
  </ul>
</template>

<script lang="ts">
export default {
  name: "treeNode",

  props: ["node"],
  mounted(){
    // console.log(1, this.node)
  },
  methods: {
    opCurrentNode(current_node) {
      if (current_node.children && current_node.children.length > 0) {
        return current_node.name + " (" + current_node.children.length + ")";
      } else if (current_node.name) {
        return current_node.name;
      }
    },
    showNode(node) {
      if(node === undefined || node === null || !node.name || node.name.length === 0) {
        return false
      } else if (node.children && node.children.length > 0) {
        return true
      } else {
        return false
      }
    },
  },
};
</script>
