
<template>
    <div id="keymap_panel">
    <div ref="iconPanelOpen" v-on:click="showMapPanel = !showMapPanel" class="iconPanel iconOpen" v-bind:class="{ active: showMapPanel }">
      <font-awesome-icon icon="map" />
    </div>
    <div ref="iconPanelClose" v-if="showMapPanel" v-on:click="showMapPanel = false" class="iconPanel iconClose">
      <font-awesome-icon icon="times-circle" />
    </div>
    <div ref="keymap" v-show="showMapPanel" id="keymap"></div>
    </div>
</template>

<style scoped>

#keymap_panel {
  z-index: 1000;
}

#keymap {
  background-color: #f1f1f1;
  position: absolute;
  top:0px;
  left:0px;
  width: 200px;
  height: 200px;
  z-index: 1002;
}

/* Style the button that is used to open and close the collapsible content */
.iconPanel {
 background-color: transparent;
 color: white;
 cursor: pointer;
 padding: 5px;
 border: none;
 text-align: left;
 outline: none;
 font-size: 25px;
 z-index: 1003;
 position: absolute;
 top:0px;
 width: 30px;
 height: 30px;
 z-index: 2002;
}

/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
.active, .iconPanel:hover {
 color: #000 !important;
}

.iconOpen {
 right:65px;
}

.iconClose {
 left:0px;
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
      return {
        showMapPanel: true,
      }
  },

  mounted: function () {
    this.map_panel_render();
  },

  created: function () {

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
              src: require('../assets/viewpoints_dot.png')
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
    create_map_panel: function () {
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
          target: this.$refs.keymap
      });

      let component = this

      this.map_panel.on('moveend', function(e) {
          console.log('moveend')
          component.updateContext()
      })

      this.map_panel.on('singleclick', function(evt) {
          let sample = component.map_panel.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
              //you can add a condition on layer to restrict the listener
              return [layer, feature];
              });
          // console.log(sample,sample[1].getId())
          if (sample && sample[0] === component.other_panos_layer) {
              console.log(sample[1].getId())
              component.$parent.$emit('MapPanelClick',sample[1].getId())
          }
      });
    },

    set_utm_proj: function (utm_code) {
            let utm_zone = utm_code.slice(0,-1)
            const utm_suffix = utm_code.slice(-1)
            console.log(utm_code,utm_zone,utm_suffix,"NPQRSTUVZXY".includes(utm_suffix))
            if (!"NPQRSTUVZXY".includes(utm_suffix)) { utm_zone += '+south' }
            this.utm_proj = "+proj=utm +zone=%z +datum=WGS84 +units=m +no_defs".replace("%z", utm_zone) // + ("N" == utm_or ? "" : "+south"));
            console.log(utm_code,utm_zone,utm_suffix, this.utm_proj)
        },

    updateLocation: function (pano_key, lon, lat, utm_x, utm_y, utm_code) {
            console.log("VIEWUPDATE", this.$parent.pano_key)
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
            console.log("VIEWCHANGED",rot, rot * Math.PI / 180)
            this.map_panel.changed();
        },

    map_panel_render: function() {
      console.log('RENDER')
      this.create_map_panel();
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
