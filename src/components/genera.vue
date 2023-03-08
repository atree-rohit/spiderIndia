<style scoped>
    .output-container{
        border: 2px solid steelblue;
        padding: .25rem .5rem;
        font-size:.75rem;
        display:flex;
        justify-content: space-between;
        /* position: relative; */
    }
    .output-container .output{
        /* border: 2px solid steelblue; */
    }
    .output-container button{
        /* position: absolute;
        top: 0;
        right: 0 */
    }
    .species-tree-container{
        border: 1px solid red;
        display:flex;
        flex-wrap: wrap;
        justify-content: center;
        padding: 1rem;
        max-height: 20vh;
        overflow: auto;
    }

    .species-tree-container span{
        border: 1px solid #bbb;
        border-radius: 1rem;
        padding: 0.5rem;
        margin: 0.25rem;
        cursor: pointer;
        font-size: .85rem;
    }

    .species-tree-container span:hover{
        background: #ccc;
    }
    .species-tree-container span.selected{
        background: yellow;
    }
    .species-tree-container span.set{
        background: #9f9;
        border: 1px solid #0a0;
        color: #030;
    }
    .family-details{
        display:flex;
        flex-direction: column;
    }
    .family-details > div{
        display: flex;
        flex-direction: row;
        padding: 0.5rem;
        border: 1px solid #bbb;
        border-radius: 1rem;
    }

    .family-details-container .images-section{
        max-height: 40vh;
        border: 1px solid green;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        overflow: auto;
        padding: .5rem;
        gap: 7px;
    }

    .family-details-container .images-section .img-container {
        position: relative;
        border: 5px solid transparent;
        overflow: hidden;
    }
    .family-details-container .images-section .img-container img{
        overflow: hidden;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .family-details-container .images-section .img-container.selected{
        border: 5px solid green;
        border-radius: 2rem;
    }

    .family-details-container .images-section .img-container.selected img{
        border-radius: 1.5rem;
    }

    .family-details-container .images-section .img-container .overlay{
        position: absolute;
        top: 100%;
        /* left: 10%; */
        width: 100%;
        height: 25%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-weight: bold;
        transition: all 0.25s;
    }
    .family-details-container .images-section .img-container:hover .overlay{
        top: 40%;
    }

    .family-details-container .images-section .img-container .overlay:hover{
        cursor: pointer;
        height: 60%;
        top:20%;
    }

    .family-details > div div{
        margin: auto 0;
        padding: 0.5rem;
    }
    .family-details > div div:first-child{
        border: 1px solid #0b0b0b;
        border-radius: 1rem;
        font-weight: bold;
        /* padding-right: 0.5rem; */
    }

    .family-details > div div:nth-child(2){
        /* background: red;; */
    }

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .modal-image {
        max-width: 90%;
        max-height: 90%;
    }

    .close-button {
        position: absolute;
        top: 20px;
        right: 20px;
        background-color: #fff;
        border: none;
        border-radius: 5px;
        padding: 10px;
        font-weight: bold;
        cursor: pointer;
    }

</style>

<template>
    <div v-if="selected_image !== null" class="modal">
        <img :src="selected_image" alt="image" class="modal-image" />
        <button class="close-button" @click="selected_image = null">Close</button>
    </div>
    <div class="output-container">
        <div class="output" ref="output">
            {{ set_family_images }}
        </div>
        <button class="copy-button" @click="copyOutput">Copy</button>
    </div>
    <div class="species-tree-container">
        <span
            v-for="family in families"
            :key="family"
            @click="selected_family = family"
            :class="{ selected: selected_family == family, set: imgSet(family) }"
        >{{ family }}</span>
    </div>
    <div
        v-if="selected_family != ''"
        class="family-details-container"
    >
        <div class="images-section">
            <div
                class="img-container"
                v-for="img in family_images"
                :key="img.id"
                :class="imgSelectedClass(img)"
                @click="select_image(img)"
            >
                <img 
                    :src="img.img"
                >
                <div class="overlay" @click.stop="selectModalImage(img, 'medium')">
                    Expand
                </div>
            </div>
        </div>
        <div class="family-details">
            <div>
                <div>Family: </div>
                <div>{{ selected_family_data.name }}</div>
            </div>
            <div>
                <div>Description: </div>
                <div>{{ selected_family_data.description }}</div>
            </div>
            <div>
                <div>Habitat: </div>
                <div>{{ selected_family_data.habitat }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import speciesTree from './speciesTree.vue'
export default {
    name: 'genera',
    components: {
        speciesTree
    },
    data() {
        return {
            taxon_fields: ["taxon_class","taxon_order","taxon_suborder","taxon_superfamily","taxon_family","taxon_subfamily","taxon_tribe","taxon_subtribe","taxon_genus","taxon_species","taxon_subspecies"],
            selected_family: "",
            set_family_images: {},
            selected_image: null
        }
    },
    computed: {
        ...mapState(['inat_data', 'selected_taxa', 'taxa_tree', 'family_data']),
        families(){
            let op = []
            if(this.inat_data.length > 0){
                op = [...new Set(this.inat_data.map((d) => d.taxon_family).filter((d) => d.length > 0))]
            }
            return op
        },
        selected_family_data(){
            let op = {
                name: "",
                description: "",
                habitat: ""
            }
            if(this.selected_family.length > 0){
                op = this.family_data.find((d) => d.name == this.selected_family)
            }
            return op
        },
        family_images(){
            let op = []
            op = this.inat_data.filter((d) => d.taxon_family == this.selected_family).map((d) => {
                return {
                    id: d.id,
                    img: d.image_url.replace("medium", "square")
                }
            })
            
            return op
        }
    },
    methods:{
        select_image(img){
            if(this.set_family_images[this.selected_family] == undefined){
                this.set_family_images[this.selected_family] = {}
            }
            if(this.set_family_images[this.selected_family][img.id] == img.img){
                delete this.set_family_images[this.selected_family][img.id]
            } else {
                this.set_family_images[this.selected_family][img.id] = img.img
            }
        },
        imgSelectedClass(img){
            let op = ""
            if(this.set_family_images[this.selected_family] != undefined){
                if(this.set_family_images[this.selected_family][img.id] != undefined){
                    op = "selected"
                }
            }
            return op
        },
        imgSet(family){
            let op = false
            if(this.set_family_images[family] != undefined){
                if(Object.keys(this.set_family_images[family]).length > 0){
                    op = true
                }
            }
            return op
        },
        copyOutput() {
            const outputText = this.$refs.output.textContent;
            navigator.clipboard.writeText(outputText).then(() => {
                alert('Text copied to clipboard, now send me the contents of the clipboard by email')
            }, (err) => {
                alert('Could not copy text: ', err)
            })  
        },
        selectModalImage(img, size){
            this.selected_image = img.img.replace("square", size)
            console.log(img)
        }
    }
}
</script>