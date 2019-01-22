
<template>
  <div id="fix_panel">
    <div ref="fixIcon" v-on:click="visible = !visible" class="fixIcon" v-bind:class="{ active: visible }">
            <font-awesome-icon icon="ruler-vertical" />
    </div>
    <div class="formPanel" v-if="visible">
        <section size="is-small" >
            <b-collapse class="card">
                <div slot="trigger" slot-scope="props" class="card-header">
                    <p class="card-header-title">
                        PANORAMA CORRECTION
                    </p>
                    <a class="card-header-icon">
                        <b-icon
                            :icon="props.open ? 'menu-down' : 'menu-up'">
                        </b-icon>
                    </a>
                </div>
                <div class="card-content">
                    <!--
                    <b-field label="Tag type">
                        <b-select placeholder="Select a tag type">
                        <option v-for="item in opts" :value="item.value">
                            {{item.key}}
                        </option>
                        </b-select>
                    </b-field>
                    -->

                    <b-field :label="panoKey" />
                    <b-field label="Drift along track axis">
                        <b-input type="number" placeholder="0.00" step=".2" ref="yfield" v-model="y_fix_field" @input="fix_changed"></b-input>
                    </b-field>
                    <b-field label="Drift aside track axis ">
                        <b-input type="number" placeholder="0.00" step=".2" ref="xfield" v-model="x_fix_field" @input="fix_changed"></b-input>
                    </b-field>
                    <b-field label="Height from ground">
                        <b-input type="number" placeholder="0.00" step=".2" ref="hfield" v-model="height_fix_field" @input="fix_changed"></b-input>
                    </b-field>
                    <b-field label="Roll angle">
                        <b-input type="number" placeholder="0.00" step=".2" ref="rollfield" v-model="roll_fix_field" @input="fix_changed"></b-input>
                    </b-field>
                    <b-field label="Pitch angle">
                        <b-input type="number" placeholder="0.00" step=".2" ref="pitchfield" v-model="pitch_fix_field" @input="fix_changed"></b-input>
                    </b-field>
                    <b-field label="track angle">
                        <b-input type="number" placeholder="0.00" step=".2" ref="trackfield" v-model="track_fix_field" @input="fix_changed"></b-input>
                    </b-field>
                    <b-field label="Note">
                        <b-input type="textarea" ref="notefield" v-model="note_field"></b-input>
                    </b-field>
                </div>
                <footer class="card-footer">
                    <a class="card-footer-item" v-on:click="Tdiscard">Discard</a>
                    <a class="card-footer-item" ></a>
                    <a class="card-footer-item" v-on:click="Tkeep">Keep</a>
                </footer>
            </b-collapse>
        </section>
    </div>
  </div>

</template>

<style scoped lang="scss">
/* Style the button that is used to open and close the collapsible content */
.formPanel {
  position: absolute;
  bottom:0px;
  right:0px;
  text-align: left;
  width: 300;
  height: auto;
  z-index: 2002;
  padding: 5px;
}

html {
  font-size: 10px;
}

.fix_panel {
    z-index: 2000;
}

.fixIcon {
 background-color: transparent;
 color: white;
 cursor: pointer;
 padding: 5px;
 border: none;
 text-align: left;
 outline: none;
 font-size: 20px;
 z-index: 2003;
 position: absolute;
 top:0px;
 width: 30px;
 right: 125px;
 height: 30px;
 z-index: 2002;
}

.active, .fixIcon:hover {
 color: #000 !important;
}

@import "~bulma/sass/utilities/_all";

</style>

<script>
/* eslint-disable */

export default {
  name: 'fixform',

  data: function () {
    return {
      visible: false,
      panoKey:undefined,
      x_fix_field: 0,
      y_fix_field: 0,
      roll_fix_field: 0,
      pitch_fix_field: 0,
      track_fix_field: 0,
      height_fix_field: 0,
      note_field: "",
      opts: [
        {key: 'UNO', value: 'uno'},
        {key: 'DUE', value: 'due'},
        {key: 'TRE', value: 'tre'}
      ]
    }
  },

  mounted: function () {
  },

  created: function () {
    console.log('FIX created')
    this.$parent.$on('PanoramaUpdated', this.updateLocation)
    //this.$parent.$on('editSpot', this.editTag)
  },

  watch: {

  },



  methods: {

    reset: function () {
        this.x_fix_field = 0;
        this.y_fix_field = 0;
        this.height_fix_field = this.height;
        this.roll_fix_field = this.roll;
        this.pitch_fix_field = this.pitch;
        this.track_fix_field = this.pano_track;
        this.note_field = this.note
    },

    updateLocation: function(pano_key, lon, lat, utm_x, utm_y, utm_code, utm_srid, height, track, roll, pitch, note, creator){
        this.panoKey = pano_key;
        this.lat = lon;
        this.lon = lat;
        this.x = utm_x;
        this.y = utm_y;
        this.utm_code = utm_code;
        this.roll = roll
        this.roll_fix_field = roll;
        this.pitch = pitch
        this.pitch_fix_field = pitch;
        this.note = note;
        this.pano_track = track;
        this.track_fix_field = track;
        this.height = height;
        this.height_fix_field = height;
        this.reset()
        this.reset_D()
    },

    fix_changed: function() {
        let correction = {
            dx: this.x_fix_field,
            dy: this.y_fix_field,
            dh: this.height_fix_field,
            dr: this.roll_fix_field,
            dp: this.pitch_fix_field,
            dt: this.track_fix_field,
        }
        this.$parent.$emit('fixPanorama', correction)
        this.reset_D()

    },

    Tkeep: function() {

        const back_rotation = - Math.PI * this.pano_track / 180;
        const back_x = this.x_fix_field * Math.cos(back_rotation) - this.y_fix_field * Math.sin(back_rotation);
        const back_y = this.y_fix_field * Math.cos(back_rotation) + this.x_fix_field * Math.sin(back_rotation);
        let fixture = {
            x: back_x,
            y: back_y,
            h: this.height_fix_field,
            r: this.roll_fix_field,
            p: this.pitch_fix_field,
            t: this.track_fix_field,
            note: this.note_field
        }
        this.$parent.$emit('keepPanoramaFix',fixture)
        this.reset()
        //this.reset_D()
        this.visible = undefined
    },

    Tdiscard: function() {
        this.$parent.$emit('triggerPanoChange',this.panoKey)
        this.reset()
        this.visible = undefined
    }
  }
}
</script>
