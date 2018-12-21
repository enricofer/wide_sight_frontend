
<template>
    <div id="info_panel">
      <div class="iconPanel" v-on:click="showInfoPanel = !showInfoPanel;" v-bind:class="{ active: showInfoPanel }">
          <font-awesome-icon icon="info-circle" />
      </div>
      <div class="content" v-if="showInfoPanel">
        <ul>
          <li>KEY: {{key}}</li>
          <li>LAT: {{lat.toFixed(7)}}</li>
          <li>LON: {{lon.toFixed(7)}}</li>
          <li>X: {{x.toFixed(1)}}</li>
          <li>Y: {{y.toFixed(1)}}</li>
          <li>HEAD: {{heading.toFixed(1)}}</li>
          <li>CURSOR_HEAD: {{cursor_head.toFixed(1)}}</li>
          <li>CURSOR_DIST: {{cursor_dist.toFixed(1)}}</li>
        </ul>
      </div>
    </div>
</template>

<style scoped>
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
  z-index: 2001;
  position: absolute;
  right:0px;
  top:0px;
  width: 30px;
  height: 30px;
  position: absolute;
  top:0px;
  right:0px;
}

/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
.active, .iconPanel:hover {
 color: #000;
}

/* Style the collapsible content. Note: hidden by default */
#info_panel {
  z-index: 2000;
}

.content {
  position: absolute;
  bottom:0px;
  right:0px;
  text-align: left;
  width: auto;
  height: auto;
  z-index: 2002;
  padding: 5px;
}

.content ul {
  font-size: 10px;
  color: #fff;
  line-height: 1;
  list-style-type: none;
  margin: 0;
  padding: 0;
}
</style>

<script>
/* eslint-disable */


export default {
  name: 'infopanel',

  data: function () {
    return {
      key: '',
      lat: 0,
      lon: 0,
      x: 0,
      y: 0,
      utm_code: '',
      heading: 0,
      cursor_head: 0,
      cursor_dist: 0,
      showInfoPanel: false,
    }
  },

  mounted: function () {
  },

  created: function () {

    this.$parent.$on('PanoramaUpdated', this.updateLocation)
    this.$parent.$on('ViewChanged', this.rotate_pano)
    this.$parent.$on('PanoCursorChanged', this.cursor_pano)

  },

  computed: {
  },

  methods: {
      updateLocation: function(pano_key, lon, lat, utm_x, utm_y, utm_code){
        this.key = pano_key;
        this.lat = lon;
        this.lon = lat;
        this.x = utm_x;
        this.y = utm_y;
        this.utm_code = utm_code;
      },

      rotate_pano: function(rot){
        this.heading = rot;
      },

      cursor_pano: function(head, distance){
        this.cursor_head = head;
        this.cursor_dist = distance;
      },
    }
}
</script>
