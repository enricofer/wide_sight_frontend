<template>
    <div id="widesight">
      <infopanel></infopanel>
      <keymap></keymap>
      <viewer></viewer>
      <tag></tag>
      <tagform></tagform>
    </div>
</template>

<style scoped>
#widesight {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height:100%;
  position: relative;
}

</style>

<script>
/* eslint-disable */
/*  <router-view/> */
import infopanel from '@/components/ws_infopanel'
import keymap from '@/components/ws_keymap'
import viewer from '@/components/ws_viewer'
import tag from '@/components/ws_tag'
import tagform from '@/components/ws_form'
// import infopanel from '@/components/ws_infopanel'

export default {
  name: 'widesight',

  components: {
    infopanel,
    viewer,
    tag,
    tagform,
    keymap,
  },

  props: [
    'backend',
    'apikey',
    'panokey',
    'overlay',
    'mode',
  ],

  created: function() {
    if (this.backendEndpoint == undefined) {
      console.log ('ENDPOINT CORRETTO')
      this.backendEndpoint = window.location.protocol+"//"+window.location.hostname+':'+window.location.port
    }
  },

  mounted: function() {
    console.log('APP MOUNTED')
  },

  data: function () {
    return {
      backendEndpoint: this.backend, //'http://127.0.0.1:8000/',//'http://172.25.193.167:8989/',
      backendApikey: this.apikey, //'375368dfd01b9bd9d26e2284ce18398adbd07e93',
      initialPano: this.panokey,
      externalOverlay: this.overlay,
      operating_mode: this.mode,
      current_pano: undefined,
      // lat: 11,
      // lon: 45,
    }
  },

  methods: {
    getPanoramaDetails: function(pano_key) {
      var context = this
      var promiseObj = new Promise(function(resolve, reject){
         var xhr = new XMLHttpRequest();
         console.log('ENDPOINT',context.backendEndpoint)
         xhr.open('GET', context.backendEndpoint + "/panoramas/" + pano_key + "/?apikey=" + context.backendApikey, true);
         xhr.send();
         xhr.onreadystatechange = function(){
         if (xhr.readyState === 4){
            if (xhr.status === 200){
               var resp = xhr.responseText;
               var respJson = JSON.parse(resp);
               resolve(respJson);
            } else {
               reject(xhr.status);
               console.log("xhr failed");
            }
         }
      }
    });
    return promiseObj;
    },

    getPanoramas: function(filters='') {
      var context = this
      var promiseObj = new Promise(function(resolve, reject){
         var xhr = new XMLHttpRequest();
         // if (as_geojson == true) { as_geojson = '&as_geojson=true' } else { as_geojson = '' }
         xhr.open('GET', context.backendEndpoint + "/panoramas/?apikey=" + context.backendApikey + filters, true);
         xhr.send();
         xhr.onreadystatechange = function(){
         if (xhr.readyState === 4){
            if (xhr.status === 200){
               var resp = xhr.responseText;
               var respJson = JSON.parse(resp);
               resolve(respJson);
            } else {
               reject(xhr.status);
               console.log("xhr failed");
            }
         }
      }
    });
    return promiseObj;
    }

  }
}
</script>
