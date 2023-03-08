<style>
    #map-container{
        background-color: rgb(180,180,200);
    }
    .district-boundary {
        fill: #000;
        stroke: #fff;
        stroke-width: 0.25px;
    }
    .polygon:hover {
        fill: rgba(255,255,0,1);
    }
    input.slider{
        width: 100%;
    }
</style>


<template>
    <div id="map-container"></div>
</template>

<script>
import * as d3 from 'd3'
import * as h3 from 'h3-js';
import { mapState } from 'vuex'
import * as d3Legend from "d3-svg-legend"


import districtsMap from '../assets/data/states.json'
export default {
    name: 'h3Map',
    data() {
        return {
            svg: null,
            legend: null,
        }
    },
    props: {
        h3_zoom: {
            type: Number,
            default: 3,
        },
    },
    mounted() {
        window.addEventListener('resize', this.renderMap)
        this.renderMap()
    },
    unmounted() {
        window.removeEventListener('resize', this.renderMap)
    },
    watch: {
        filtered_data() {
            this.renderMap()
        },
        h3_zoom(){
            this.renderMap()
        }
    },
    computed: {
        ...mapState(['filtered_data']),
        points() {
            return this.filtered_data.map((o) => [parseFloat(o.longitude).toFixed(4), parseFloat(o.latitude).toFixed(4), o.id])
        },
        color() {
            const max = d3.max(this.polygons.map((p) => p.observations))
            let opacity = 1
            if(this.h3_zoom < 3){
                opacity = 0.5
            } else if (this.h3_zoom < 6){
                opacity = 0.75
            }
            return d3.scalePow().domain([0, max]).range([`rgba(255, 100, 100, ${opacity})`, `rgba(100, 255, 100, ${opacity})`])
        },
        polygons() {
            let op = {}
            let points_grouped = d3.rollups(this.points, (v) => v.length ,(d) => `${d[0]},${d[1]}` )
            points_grouped.forEach((point) => {
                let [lat, lng] = point[0].split(',')
                const h3Address = h3.latLngToCell(lng, lat, parseInt(this.h3_zoom))
                if (op[h3Address] !== undefined) {
                    op[h3Address].observations += point[1]
                } else {
                    const h3Geo = this.hexFeatures(h3.cellToBoundary(h3Address, true))
                    op[h3Address] = {
                        observations: point[1],
                        polygon: h3Geo.features[0],
                        address: h3Address,
                    }
                }
            })
            return Object.values(op)
        },
        zoom() {
			return d3.zoom()
				.scaleExtent([.5, 250])
				.on('zoom', this.handleZoom)
		},
    },
    methods: {
        init_legend() {		
			return d3Legend.legendColor()
                .shapeWidth(45)
                .scale(this.color)
                .labelFormat(d3.format(".0f"))
                .orient('horizontal')
                .labelOffset(-10)
                .labelAlign("start")
                .cells(6)
		},	     
        renderMap() {
            // Extracted functions for repeated tasks
            const removeExistingSvg = () => {
                const svg = d3.select('#map-container svg')
                if (!svg.empty()) {
                    svg.remove()
                }
            }
            const createTooltip = () => {
                let tooltip = d3.select('.tooltip')
                if (tooltip.empty()) {
                    tooltip = d3.select('body')
                        .append('div')
                        .attr('class', 'tooltip')
                        .style('opacity', 0)
                }
                return tooltip
            }
            const createMouseoverFunction = (tooltip) => {
                return () => tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9)
            }
            const createMousemoveHexagonFunction = (hexTooltip) => {
                return (event, d) => hexTooltip(event, d)
            }
            const createMouseoutFunction = (tooltip) => {
                return () => tooltip.transition()
                    .duration(500)
                    .style('opacity', 0)
            }
            const createPolygonPath = (d, path) => {
                return path(d.polygon)
            }
            const createPolygonFill = (d, color) => {
                return color(d.observations)
            }
    
            // Remove existing SVG if it exists
            removeExistingSvg();
    
            // Get width and height of map container
            const width = parseInt(d3.select('#map').style('width'))
            const height = parseInt(d3.select('#map').style('height'))
    
            // Set up projection and path
            const projection = d3.geoMercator().fitSize([width, height], districtsMap)
            const path = d3.geoPath(projection)
    
            // Create tooltip and mouse event functions
            const tooltip = createTooltip()
            const mouseover = createMouseoverFunction(tooltip)
            const mousemoveHexagon = createMousemoveHexagonFunction(this.hexTooltip)
            const mouseout = createMouseoutFunction(tooltip)
            
            // Get polygons and color function
            const polygons = this.polygons
            const color = this.color
    
            // Create SVG element and group
            this.svg = d3.select('#map-container')
                .append('svg')
                .attr('preserveAspectRatio', 'xMinYMin meet')
                .attr('width', width)
                .attr('height', height)
            const g = this.svg.append('g')
    
            // Draw district boundaries
            g.selectAll('.district-boundary')
                .data(districtsMap.features)
                .enter()
                .append('path')
                .attr('d', path)
                .classed('district-boundary', true)
    
            // Draw polygons
            g.selectAll('.polygon')
                .data(polygons)
                .enter()
                .append('path')
                .classed('polygon', true)
                .attr('d', d => createPolygonPath(d, path))
                .attr('fill', d => createPolygonFill(d, color))
                .on('mouseover', mouseover)
                .on('mousemove', mousemoveHexagon)
                .on('mouseout', mouseout)
    
            // Draw legend and enable zoom
            g.append("g")
                .attr("transform", `translate(${width * .5}, 50)`)
                .call(this.init_legend())
            g.call(this.zoom);
        },
        handleZoom(e){
			this.svg.selectAll('path')
                .attr('transform', e.transform)
        },
        hexFeatures(array) {
            return {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [array.reverse()],
                    },
                }],
            }
        },
        hexTooltip(event, d) {
            const h3Index = d.address
            const area = h3.cellArea(h3Index, 'km2')
            const tooltip = d3.select('.tooltip')
            tooltip.html(`Area: ${area.toFixed(2)} km<sup>2</sup><br>observations: ${d.observations}`)
                .style('left', `${(event.pageX - 50)}px`)
                .style('top', `${(event.pageY - 10)}px`)
        },
        cellArea(h3Index, unit){
            h3.cellArea(h3Index, unit)
        }
    },
}
</script>