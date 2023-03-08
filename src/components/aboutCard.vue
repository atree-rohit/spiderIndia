<style scoped>
    .card{
        border: 1px solid black;
        max-height: 40vh;
        overflow: auto;
    }

    .card .card-heading{
        background-color: #f1f1f1;
        padding: .75rem;
        font-size: 1.5rem;
        text-align: center;
        display:flex;
    }

    .card .card-heading .title{
        flex: 1 1 0;
    }

    .card .card-heading .data-switch{
        display: flex;
        justify-content: center;
        border: 1px solid #aaa;
        border-radius: 50px;
        overflow: hidden;
    }

    .card .card-heading .data-switch button{
        border: 1px solid #ccc;
        padding: .5rem;
        font-size: .75rem;
    }

    .card .card-heading .data-switch button.selected{
        background-color: rgb(1, 133, 1);
    }

    .card .card-body{
        padding: .75rem;
        display:flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    .card .card-body .chip{
        border: 1px solid red;
        padding: .25rem;
        margin: .125rem;
        border-radius: 1rem;
        font-size: .75rem;
    }
</style>

<template>
    <div class="card">
        <div class="card-heading">
            <div class="title">{{ level }}</div>
            <div class="data-switch">
                <button
                    v-for="m in modes"
                    :key="m"
                    :class="{selected: m == mode}"
                    @click="mode = m"
                >{{ m }}</button>
            </div>
        </div>
        <div class="card-body">
            <template v-if="mode == 'Chips'">
                <span class="chip"
                    v-for="value in sortedObjectKeys(level)"
                    :key="value"
                    v-text="`${value}: ${stats[value]}`"
                />
            </template>
            <div :id="`${level}-pie-chart`" v-else-if="mode == 'Pie Chart'" />

        </div>
    </div>
</template>

<script>
import * as d3 from 'd3'
export default{
    name: 'AboutCard',
    props: {
        level: {
            type: String,
            required: true
        },
        stats: {
            type: Object,
            required: true,
            default: {}
        }
    },
    data(){
        return {
            svg: null,
            modes: ["Chips", "Pie Chart", "Bar Chart"],
            mode: "Pie Chart"
        }
    },
    watch: {
        mode(newVal){
            if(newVal == "Pie Chart"){
                // this.clearChart()
                this.renderChart()
            }
        }
    },
    mounted(){
        this.renderChart()
    },
    methods: {
        clearChart() {
            const target = `${this.level}-pie-chart`;
            const svg = d3.select(`#${target} svg`);
            if (svg) {
                svg.remove();
            }
        },
        renderChart(){
            const data = this.stats
            const target = `${this.level}-pie-chart`


            // set up the dimensions of the chart
            const width = 225;
            const height = 225;
            const radius = Math.min(width, height) / 2;

            // create the color scale
            const color = d3.scaleOrdinal()
                .domain(Object.keys(data))
                .range(d3.schemeCategory10);

            // create the arc generator
            const arc = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);

            // create the pie generator
            const pie = d3.pie()
                .sort(null)
                .value(d => d[1]);

            if (this.svg) {
                this.svg.remove()
            }
            // create the SVG element
            this.svg = d3.select(`#${target}`)
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', `translate(${width / 2}, ${height / 2})`);

            // create the pie slices
            const g = this.svg.selectAll('arc')
                .data(pie(Object.entries(data)))
                .enter().append('g');

            // add the pie slice paths
            g.append('path')
                .attr('d', arc)
                .style('z-index', 1)
                .style('fill', d => color(d.data[0]));

            // add the text labels for the pie slices
            g.append('path')
                .attr('d', arc)
                .style('fill', d => color(d.data[0]))
                .on("mouseover", function() {
                    d3.select(this.parentNode).selectAll("text").style("visibility", "visible");
                })
                .on("mouseout", function() {
                    d3.select(this.parentNode).selectAll("text").style("visibility", "hidden");
                });

            // add the text labels for the pie slices
            g.append('text')
                .attr('transform', d => `translate(${arc.centroid(d)})`)
                .attr('dy', '0.35em')
                .attr('visibility', 'hidden')
                .attr("text-anchor", "middle")
                .style('z-index', 10)
                .text(d => `${d.data[0]}`);
                
                // add the text labels for the pie slice values
                g.append('text')
                .attr('transform', d => `translate(${arc.centroid(d)})`)
                .attr('dy', '1.5em')
                .attr('visibility', 'hidden')
                .attr("text-anchor", "middle")
                .style('z-index', 10)
                .text(d => `${d.data[1]}`);
                console.log('rendering', this.svg)
        },
        sortedObjectKeys(){
            return Object.keys(this.stats).sort((a,b) => this.stats[b]-this.stats[a])
        },
    }
}
</script>