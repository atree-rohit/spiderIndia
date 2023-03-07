<style scoped>
    .label{
        display: flex;
        align-items: center;
    }

</style>

<template>
    <div>
        <div ckass="label">{{ name }}</div>
        <species-tree 
            v-for="child in children"
            :key="child.name"
            :name="child.name"
            :children="child.children"
        />
    </div>
</template>

<script lang="ts">
export default {
    name: 'speciesTree',
    data() {
        return {
        }
    },
    props:{
        name: {
            type: String,
            default: 'Species Tree'
        },
        children: {
            type: Array,
            default: []
        }
    },
    mounted() {
        console.clear()
    },
    watch: {
    },
    computed: {
    },
    methods: {
    }
}
</script>