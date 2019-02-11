<template>
    <div id="widesight">
      <infopanel></infopanel>
      <keymap></keymap>
      <viewer></viewer>
      <tag></tag>
      <tagform></tagform>
      <optionsform></optionsform>
      <fixform></fixform>
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
  overflow: hidden;
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
import optionsform from '@/components/ws_opts'
import fixform from '@/components/ws_fix'
// import infopanel from '@/components/ws_infopanel'

export default {
  name: 'widesight',

  components: {
    infopanel,
    viewer,
    tag,
    tagform,
    keymap,
    optionsform,
    fixform,
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

    const getCookie = function (name) {
          var cookieValue = null;
          if (document.cookie && document.cookie !== '') {
              var cookies = document.cookie.split(';');
              for (var i = 0; i < cookies.length; i++) {
                  var cookie = $.trim(cookies[i]);
                  // Does this cookie string begin with the name we want?
                  if (cookie.substring(0, name.length + 1) === (name + '=')) {
                      cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                      break;
                  }
              }
          }
          return cookieValue;
      }

      const csrfSafeMethod = function (method) {
          // these HTTP methods do not require CSRF protection
          return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
      }

      this.csrftoken = getCookie('csrftoken');

      const component = this

      $.ajaxSetup({
          beforeSend: function(xhr, settings) {
              xhr.setRequestHeader ("Authorization", "Basic " + btoa(component.user + ":" + component.password));
              if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                  xhr.setRequestHeader("X-CSRFToken", component.csrftoken);
              }
          }
      });

      const userkeys_url = this.backend + "/userkeys/" //"?username=" + this.user + "&apikey=" + this.backendApikey

      $.ajax({
            type: 'GET',
            url: userkeys_url,
            data:{
              apikey: this.backendApikey,
              username: this.user
            },
            error: function(errormsg) { console.log("ERROR", errormsg);},
            success: function(resultData) {
                component.userkey = resultData["results"][0]["key"]
                console.log('USERKEY',component.userkey)
            },
      });
  },

  mounted: function() {
  },

  data: function () {
    return {
      backendEndpoint: this.backend, //'http://127.0.0.1:8000/',//'http://172.25.193.167:8989/',
      backendApikey: this.apikey, //'375368dfd01b9bd9d26e2284ce18398adbd07e93',
      initialPano: this.panokey,
      externalOverlay: this.overlay,
      operating_mode: this.mode,
      current_pano: undefined,
      csfrtoken: undefined,
      user: 'devel',
      password: 'letmein',
      userkey: undefined,
      // lat: 11,
      // lon: 45,
    }
  },

  methods: {
    getPanoramaDetails: function(pano_key) {
      var context = this
      var promiseObj = new Promise(function(resolve, reject){
         var xhr = new XMLHttpRequest();
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

    getItems: function(items,filters='') {
      var context = this
      var promiseObj = new Promise(function(resolve, reject){
         var xhr = new XMLHttpRequest();
         // if (as_geojson == true) { as_geojson = '&as_geojson=true' } else { as_geojson = '' }
         xhr.open('GET', context.backendEndpoint + "/" + items + "/?apikey=" + context.backendApikey + filters, true);
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
