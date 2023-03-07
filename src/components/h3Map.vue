<style>
    #map-container{
        background-color: rgb(180,180,200);
    }
    .district-boundary {
        fill: #fff;
        stroke: rgba(75,0,0,.5);
        stroke-width: 1px;
        /* transition: all .15s; */
    }
    .district-boundary:hover {
        fill: #ffa;
    }
    .polygon {
        stroke: rgba(255,255,255,.5);
        opacity:.75;
        /* transition: all .25s; */
        /* fill: rgba(255,0,0,.25); */
    }
    .polygon:hover {
        fill: rgba(255,255,0,.5);
    }
    input.slider{
        width: 100%;
    }
</style>

<template>
    <input class="slider" type="range" name="amountRange" min="0" max="8" v-model="h3_zoom" />
    <div id="map-container"></div>
</template>

<script>
import * as d3 from 'd3'
import * as h3 from 'h3-js';
import { mapState } from 'vuex'

import districtsMap from '../assets/data/states.json'
export default {
    name: 'h3Map',
    data() {
        return {
            h3_zoom: 3,
            svg: null,
        }
    },
    mounted() {
        console.clear()
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
            return this.filtered_data.map(
                (o) => [parseFloat(o.longitude).toFixed(4), parseFloat(o.latitude).toFixed(4), o.id],
            )
        },
        color() {
            const max = d3.max(this.polygons.map((p) => p.observations))
            // scaleLinear() scaleSqrt() scalePow() scaleLog()
            let opacity = 1
            if(this.h3_zoom < 3){
                opacity = 0.75
            } else if (this.h3_zoom < 6){
                opacity = 0.95
            }
            return d3.scalePow().domain([0, max]).range([`rgba(255, 100, 100, ${opacity})`, `rgba(100, 255, 100, ${opacity})`])
        },
        polygons() {
            let op = {}
            let points_grouped = d3.rollups(this.points, (v) => v.length ,(d) => `${d[0]},${d[1]}` )
            console.log(points_grouped)
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
				// .translateExtent([[-0.5 * this.width,-0.75 * this.height],[2.5 * this.width, 2.5 * this.height]])
				.on('zoom', this.handleZoom)
		},
    },
    methods: {
        renderMap() {
            if (!d3.select('#map-container svg').empty()) {
                d3.selectAll('#map-container svg').remove()
            }
            const width = parseInt(d3.select('#map').style('width'), 10)
            const height = parseInt(d3.select('#map').style('height'), 10)
            const projection = d3.geoMercator().scale(1).translate([0, 0])
            const path = d3.geoPath().projection(projection)
            let tooltip = null
            if (!d3.select('.tooltip').empty()) {
                tooltip = d3.select('.tooltip')
            } else {
                tooltip = d3.select('body')
                    .append('div')
                    .attr('class', 'tooltip')
                    .style('opacity', 0)
            }
            const b = path.bounds(districtsMap)
            const s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height)
            const t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2]
            projection
                .scale(s)
                .translate(t);
            const mouseover = () => tooltip.transition()
                .duration(200)
                .style('opacity', 0.9)
            const mousemoveDistrict = (event, d) => tooltip.html(`1${d.properties.state}`)
                .style('left', `${(event.pageX - 50)}px`)
                .style('top', `${(event.pageY - 10)}px`)
            const mousemoveHexagon = (event, d) => this.hexTooltip(event, d)
            const mouseout = () => tooltip.transition()
                .duration(500)
                .style('opacity', 0)
            this.svg = d3.select('#map-container')
                .append('svg')
                .attr('preserveAspectRatio', 'xMinYMin meet')
                .attr('width', width)
                .attr('height', height)
            this.svg.append('g')
                .classed('map-boundary', true)
                .selectAll('path')
                .data(districtsMap.features)
                .enter()
                .append('path')
                .attr('d', path)
                .classed('district-boundary', true)
                // .attr('title', (d) => d.properties.district)
                // .on('mouseover', mouseover)
                // .on('mousemove', (event, d) => mousemoveDistrict(event, d))
                // .on('mouseout', mouseout)
            this.svg.append('g')
                .classed('map-points', true)
                .selectAll('path')
                .data(this.polygons)
                .enter()
                .append('path')
                .classed('polygon', true)
                .attr('d', (d) => path(d.polygon))
                .attr('fill', (d) => this.color(d.observations))
                .on('mouseover', mouseover)
                .on('mousemove', (event, d) => mousemoveHexagon(event, d))
                .on('mouseout', mouseout)

            this.svg.call(this.zoom)
        },
        handleZoom(e){
			// let text_size = (1/e.transform.k)
            // this.svg.selectAll('.poly_text')
            //     .attr('transform', e.transform)
			// 	.style('font-size', `${text_size}rem`)
            // console.log(e, e.transform)
            this.svg.selectAll('path')
                .attr('transform', e.transform)
            // this.svg.selectAll('circle')
            //     .attr('transform', e.transform)
			// 	.attr("r", text_size)
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
            // console.log(event, d)
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