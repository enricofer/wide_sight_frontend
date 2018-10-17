
<template>
    <div id="keymap"></div>
</template>

<style scoped>
#keymap {
  background-color: aqua;
  width: 200px;
  height: 200px;
  z-index: 1000;
  position: absolute;
  top:0px;
  top:0px;
}
</style>

<script>
/* eslint-disable */

import Map from 'ol/Map'
import View from 'ol/View'
import Tile from 'ol/layer/Tile'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import Vector from 'ol/layer/Vector'
import OlSourceVector from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import {transform} from 'ol/proj.js'
import Proj4 from 'proj4'
import GeoJSON from 'ol/format/GeoJSON';

export default {
  name: 'keymap',
  data: function () {
    console.log('KEYMAP DATA raggiunto')

  },

  mounted: function () {
    console.log('KEYMAP MOUNTED raggiunto')

    this.map_panel = new Map({
        layers: [
            new Tile({
                source: new OSM()
            }),
            this.other_panos_layer,
            this.marker_vector,
        ],
        view: new View({
            projection: 'EPSG:4326',
            center: [0, 0],
            zoom: 2
        }),
        //controls: ol.control.defaults().extend([
            //new ol.control.ScaleLine(),
            //new ol.control.MousePosition(),
            //new ol.control.OverviewMap()
        //]),
        target: this.$el
    });

    let component = this

    this.map_panel.on('moveend', function(e) {
        console.log('moveend')
        component.updateContext()
    })

    // this.place_pano(11,45,345,77889)
  },

  created: function () {
    console.log('KEYMAP CREATED raggiunto')

    this.$parent.$on('PanoramaUpdated', this.updateLocation)
    this.$parent.$on('ViewChanged', this.rotate_pano)
    this.$parent.$on('PanoCursorChanged', this.cursor_pano)

    this.icon = new Feature({
        geometry: new Point([0, 0]),
        name: 'pano',
        rotation: 0
    });

    this.cursor = new Feature({
        geometry: new Point([0, 0]),
        name: 'cursor',
        rotation: 0
    });

    this.pano = {};

    this.createStyle = function (feature) {
        const coords = feature.getGeometry().getCoordinates();
        if (coords[0] == 0 && coords[1] == 0) {
            var path = 'res/null.png';
        } else {
            switch (feature.get('name')) {
                case 'pano':
                    var path = require('../assets/viewpoint_dx.png')
                    break;
                case 'cursor':
                    var path = require('../assets/cursor_dx.png')
                    break;
            }
        }
        var st = new Style({
              image: new Icon( /** @type {olx.style.IconOptions} */ ({
              anchor: [0.5, 0.5],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              rotation: feature.get('rotation'),
              src: path
            }))
        });
        return st
    }

    this.other_panos_source = new OlSourceVector({})

    this.other_panos_layer = new Vector({
      title: 'other_panos_layer',
      source: this.other_panos_source,
      projection: 'EPSG:4326',
      style: new Style({
            image: new Icon( /** @type {olx.style.IconOptions} */ ({
              anchor: [0.5, 0.5],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              src: require('../assets/sprites/point4.png')
            }))
      })
    })

    this.marker_vector = new Vector({
        source: new OlSourceVector({
            features: [this.icon, this.cursor],
            projection: 'EPSG:3857',
        }),
        style: this.createStyle
    })

  },

  methods: {
    set_utm_proj: function (utm_code) {
            let utm_zone = utm_code.slice(0,-1)
            const utm_suffix = utm_code.slice(-1)
            console.log(utm_code,utm_zone,utm_suffix,"NPQRSTUVZXY".includes(utm_suffix))
            if (!"NPQRSTUVZXY".includes(utm_suffix)) { utm_zone += '+south' }
            this.utm_proj = "+proj=utm +zone=%z +datum=WGS84 +units=m +no_defs".replace("%z", utm_zone) // + ("N" == utm_or ? "" : "+south"));
            console.log(utm_code,utm_zone,utm_suffix, this.utm_proj)
        },

    updateLocation: function (lon, lat, utm_x, utm_y, utm_code) {
            console.log("updateLocation: " + this.$parent.pano_key)
            //this.utm_zone = utm_zone;
            //this.proj_def = proj_def;
            this.pano.lon = lon;
            this.pano.lat = lat;
            this.pano.x = utm_x;
            this.pano.y = utm_y;
            // console.log(utm_code)
            this.set_utm_proj(utm_code)
            this.icon.setGeometry(new Point(transform([lon, lat], 'EPSG:4326', 'EPSG:3857')))
            this.map_panel.setView(new View({
                projection: 'EPSG:3857',
                center: transform([lon, lat], 'EPSG:4326', 'EPSG:3857'),
                zoom: 17
            }))
        },

    rotate_pano: function (rot) {
            this.icon.set('rotation', rot * Math.PI / 180);
            // console.log(rot, rot * Math.PI / 180)
            this.map_panel.changed();
        },
    
    
    cursor_pano: function (head, distance) {
            const y1 = this.pano.y;
            const x1 = this.pano.x;
            let angle = 360 - head + 90;
            if (angle > 360) { angle -= 360}
            // console.log ("ANGLE",head,angle)
            let rad_angle = angle*Math.PI/180;
            const cursor_x = x1 + distance * Math.cos(rad_angle)
            const cursor_y = y1 + distance * Math.sin(rad_angle)
            this.cursor.setGeometry(new Point(Proj4( this.utm_proj, "EPSG:3857", [cursor_x, cursor_y])));
            this.map_panel.changed();
        },

    updateContext: function () {

            function format(fmt, ...args){
                return fmt
                    .split("%%")
                    .reduce((aggregate, chunk, i) =>
                        aggregate + chunk + (args[i] || ""), "");
            }

            const context_extent = this.map_panel.getView().calculateExtent(this.map_panel.getSize())
            const llc = transform([context_extent[0], context_extent[1]], 'EPSG:3857', 'EPSG:4326')
            const urc = transform([context_extent[2], context_extent[3]], 'EPSG:3857', 'EPSG:4326')
            console.log(llc,urc)
            const filters = format("&as_geojson=true&in_bbox=%%,%%,%%,%%",llc[0],llc[1],urc[0],urc[1])
            this.$parent.getPanoramas(filters).then(this.contextLoaded);
        },

    contextLoaded: function(context_details) {
            const features = (new GeoJSON()).readFeatures(context_details,{featureProjection: 'EPSG:3857'})
            console.log(context_details, features)
            this.other_panos_source = new OlSourceVector({
                features: features,
                format: new GeoJSON()
            })
            this.other_panos_layer.setSource(this.other_panos_source)
        }   

    }
}
</script>
