
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
 font-size: 20px;
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
import Circle from 'ol/style/Circle'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Vector from 'ol/layer/Vector'
import OlSourceVector from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import {transform} from 'ol/proj.js'
import Proj4 from 'proj4'
import GeoJSON from 'ol/format/GeoJSON';
import Projection from 'ol/proj/Projection';
import {addProjection} from 'ol/proj.js';
import {register} from 'ol/proj/proj4.js';

import proj4 from 'proj4'

import * as turf from '@turf/turf'

export default {
  name: 'keymap',
  data: function () {
      return {
        showMapPanel: true,
        zoom: 17,
      }
  },

  mounted: function () {

    this.map_panel_render();
  },

  created: function () {

    this.$parent.$on('PanoramaUpdated', this.updateLocation)
    this.$parent.$on('ViewChanged', this.rotate_pano)
    this.$parent.$on('PanoCursorChanged', this.cursor_pano)
    this.$parent.$on('SpotCreated', this.storeMapSpot)
    this.$parent.$on('spot_deleted', this.updateContext)
    this.$parent.$on('update_context', this.exportContext)

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

    this.spots_source = new OlSourceVector({})

    this.spots_layer = new Vector({
              title: 'Map Spots',
              visible: true,
              projection: 'EPSG:4326',
              source: new OlSourceVector({
                    url: this.spots_source,
                    format: new GeoJSON()
              }),
              style: new Style({
                    image: new Icon( /** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: require('../assets/sprites/point4.png')
              }))
        })

    })

    this.overlay_layer = new Vector({
              title: 'Overlay',
              visible: true,
              source: new OlSourceVector({
                 url: this.$parent.overlay,
                 format: new GeoJSON()
              }),
              style: new Style({
                          stroke: new Stroke({
                              color: '#0073e6',
                              width: 1
                          }),
                          fill: new Fill({
                              color: 'rgba(255, 255, 255, 0.3)'
                          }),
                          image: new Circle({
                                radius: 3,
                                fill: new Fill({color: '#0073e6'}),
                          })
                      })

          })

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
              this.overlay_layer,
              this.spots_layer,
              this.other_panos_layer,
              this.marker_vector
          ],
          view: new View({
              projection: 'EPSG:3857',
              center: [0, 0],
              zoom: this.zoom
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
          component.updateContext()
      })

      this.map_panel.on('singleclick', function(evt) {
          let sample = component.map_panel.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
              //you can add a condition on layer to restrict the listener
              return [layer, feature];
              });
          // console.log(sample,sample[1].getId())
          if (sample && sample[0] === component.other_panos_layer) {
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

    updateLocation: function (pano_key, lon, lat, utm_x, utm_y, utm_code, utm_srid) {
            console.log("LOCATION: ", pano_key, lon, lat, utm_x, utm_y, utm_code, utm_srid)
            this.pano.key = pano_key;
            this.pano.lon = lon;
            this.pano.lat = lat;
            this.pano.x = utm_x;
            this.pano.y = utm_y;
            this.pano.utm_code = utm_code;
            this.pano.utm_srid = utm_srid;
            // console.log(utm_code)
            this.set_utm_proj(utm_code)
            this.icon.setGeometry(new Point(transform([lon, lat], 'EPSG:4326', 'EPSG:3857')))
            this.map_panel.setView(new View({
                projection: 'EPSG:3857',
                center: transform([lon, lat], 'EPSG:4326', 'EPSG:3857'),
                zoom: this.zoom
            }))
            this.exportContext();
        },

    rotate_pano: function (rot) {
            this.icon.set('rotation', rot * Math.PI / 180);
            this.map_panel.changed();
        },

    map_panel_render: function() {
      this.create_map_panel();
    },

    ex_cursor_pano: function (head, distance) {
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

        cursor_pano: function (dx, dy) {
                this.cursor_x = this.pano.x + dx;
                this.cursor_y = this.pano.y + dy;
                this.cursor.setGeometry(new Point(Proj4( this.utm_proj, "EPSG:3857", [this.cursor_x, this.cursor_y])));
                this.map_panel.changed();
            },

    updateContext: function () {

            function format(fmt, ...args){
                return fmt
                    .split("%%")
                    .reduce((aggregate, chunk, i) =>
                        aggregate + chunk + (args[i] || ""), "");
            }
            this.zoom = this.map_panel.getView().getZoom();
            const context_extent = this.map_panel.getView().calculateExtent(this.map_panel.getSize())
            const llc = transform([context_extent[0], context_extent[1]], 'EPSG:3857', 'EPSG:4326')
            const urc = transform([context_extent[2], context_extent[3]], 'EPSG:3857', 'EPSG:4326')
            const filters = format("&as_geojson=true&in_bbox=%%,%%,%%,%%",llc[0],llc[1],urc[0],urc[1])
            this.$parent.getItems('panoramas',filters).then(this.contextLoaded);
            this.$parent.getItems('image_objects',filters).then(this.mapSpotsLoaded);
        },

    contextLoaded: function(context_details) {
            const features = (new GeoJSON()).readFeatures(context_details,{featureProjection: 'EPSG:3857'})
            this.other_panos_source = new OlSourceVector({
                features: features,
                format: new GeoJSON()
            })
            this.other_panos_layer.setSource(this.other_panos_source)
        },

    mapSpotsLoaded: function(context_details) {
            const features = (new GeoJSON()).readFeatures(context_details,{featureProjection: 'EPSG:3857'})
            console.log("SPOT LOADED:",features)
            this.spots_source = new OlSourceVector({
                features: features,
                format: new GeoJSON()
            })
            this.spots_layer.setSource(this.spots_source)
        },

    exportContext: function() {
        var writer = new GeoJSON();
        const utm_srid = 'EPSG:' + this.pano.utm_code.toString();
        //const utm_def = "+proj=utm +zone=" + this.pano.utm_zone + " +datum=WGS84 +units=m +no_defs"
        //const utm_def = "+proj=utm +zone=32N +datum=WGS84 +units=m +no_defs"
        proj4.defs(utm_srid, this.utm_proj);
        register(proj4)

        var utm_proj = new Projection({
            code: utm_srid,
            extent: [this.pano.x-100000,this.pano.y-100000,this.pano.x+100000,this.pano.y+100000]
        });
        addProjection(utm_proj);

        const features = this.overlay_layer.getSource().getFeatures();
        var tl = proj4(this.utm_proj).forward([this.pano.lon, this.pano.lat])
        console.log("TL", tl, this.pano, this.utm_proj);
        var bbox = [tl[0] - 200, tl[1] - 200, tl[0] + 200,tl[1] + 200];
        var transformed_features = [];
        for (var i=0; i<features.length; ++i) {
            const testGeom = features[i].getGeometry().clone()
            testGeom.transform('EPSG:3857', 'EPSG:4326');
            const testGeomJson  = JSON.parse(writer.writeGeometry(testGeom));
            const dist = turf.distance(turf.point([this.pano.lon,this.pano.lat]), turf.centroid(testGeomJson));

            if (dist < 0.05){
                const contextGeom = features[i].getGeometry().clone()
                contextGeom.transform('EPSG:3857', utm_srid);
                const contextFeatJson = JSON.parse(writer.writeFeature(features[i]));
                const contextGeomJson  = JSON.parse(writer.writeGeometry(contextGeom));
                contextFeatJson["geometry"] = contextGeomJson
                transformed_features.push(contextFeatJson)
            }
        }
        console.log("transformed_features: ", transformed_features.length)
        this.$parent.$emit('context_redraw', transformed_features)
    },

    storeMapSpot: function(img_lon,img_lat,spot_x,spot_y,spot_z) {
        const update_url = this.$parent.backend+"/image_objects/?apikey="+this.$parent.apikey;
        const spotLocation_wgs84 = proj4(this.utm_proj,"EPSG:4326").forward([this.cursor_x, this.cursor_y]) //treejs axes are rotated!!
        const component = this
        $.ajax({
            type: 'POST',
            url: update_url,
            data: {
                panorama: this.pano.key,
                type: 2,
                creator_key: this.$parent.userkey,
                img_lon: img_lon,
                img_lat: img_lat,
                lon: spotLocation_wgs84[0],
                lat: spotLocation_wgs84[1],
                utm_x: this.cursor_x,
                utm_y: this.cursor_y,
                utm_code: this.pano.utm_code,
                utm_srid: this.pano.utm_srid,
            },
            dataType: "application/json",
            //need to catch 201 http code
            success: function(resultData) { console.log("OK", resultData); },
            error: function(errormsg) {
                if (errormsg["status"] == 201) {
                    const createdKey = JSON.parse(errormsg["responseText"])["id"]
                    component.$parent.$emit('editSpot', createdKey)
                    component.updateContext();
                } else {
                    console.log("ERROR", errormsg);
                }
                },
        });
    },

    }
}
</script>
