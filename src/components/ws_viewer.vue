<template>
    <div id="container"></div>
</template>

<style scoped>
#container {
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>

<script>
/* eslint-disable */
import * as THREE from 'three'

export default {
  name: 'viewer',

  data: function () {
    console.log('DATA raggiunto')
    return {
      // backend: 'http://172.25.193.167:8989/panoramas/', // 'http://127.0.0.1:8000/panoramas/', 'http://172.25.193.167:8989/panoramas/',
      // apikey: '375368dfd01b9bd9d26e2284ce18398adbd07e93', // '375368dfd01b9bd9d26e2284ce18398adbd07e93',
      pano_key: null,
      // container_el: document.getElementById('container'),
      pano_lat: null,
      pano_lon: null,
      pano_track: null,
      utm_zone: null,
      utm_srid: null,
      utm_x: null,
      utm_y: null,
      look_at: null,

      camera: null,
      scene: null,
      geometry: null,
      texture: null,
      material: null,
      mesh: null,
      renderer: null,
      grid_mesh: null,

      isUserInteracting: false,
      lon: null,
      lat: null,
      onMouseDownMouseX: null,
      onMouseDownMouseY: null,
      onMouseDownLon: null,
      onMouseDownLat: null,

      parent_initialPano: null,
      parent_backend: null,
      parent_apikey: null,
      backend_link: null,
    }
  },

  mounted: function () {
    console.log('MOUNTED raggiunto:' + this.$el.id)
    this.load_pano(this.$parent.initialPano)
  },

  created: function () {
     this.parent_initialPano = this.$parent.initialPano
     this.parent_backend = this.$parent.backend
     this.parent_apikey = this.$parent.apikey
     this.backend_link = this.parent_backend+"/panoramas/"+this.parent_initialPano+"/?apikey="+this.parent_apikey

    console.log('CREATED raggiunto')


    this.$parent.$on('MapPanelClick', this.load_pano)
    //this.id = this._uid
    let component = this
    // this.sample_point = null
    this.point1_texture = new THREE.TextureLoader()
    console.log(require('../assets/marker.png'))
    this.point1_texture.load(
        require('../assets/sprites/point8.png'),
        function (texture) {
            const point_material = new THREE.SpriteMaterial({
                map: texture,
            });
            component.sample_point = new THREE.Sprite(point_material);
            component.sample_point.scale.set(40, 40, 1)
            component.sample_point.position.set(1000, 1000, 1000);

        }
    )

    const location_geometry = new THREE.CircleGeometry( 2, 32 );
    const location_material = new THREE.MeshBasicMaterial({
        color: 0xfffff0,
        //wireframe: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2

    });
    this.location_spot1 = new THREE.Mesh( location_geometry, location_material );
    this.location_spot1.rotation.x = -Math.PI / 2;

    this.location_spot2 = new THREE.Mesh( new THREE.CircleGeometry( 1, 32 ), location_material );
    this.location_spot2.position.set(0, 0.1, 0);
    this.location_spot2.rotation.x = -Math.PI / 2;
    const location_line_geometry = new THREE.Geometry();
    const location_line_material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 4,
    });
    location_line_geometry.vertices.push(
    	new THREE.Vector3( 0, 0, 0 ),
    	new THREE.Vector3( 0, 1000, 0 )
    );
    this.location_line = new THREE.Line( location_line_geometry, location_line_material );
    this.location = new THREE.Object3D()
    this.location.add(this.location_spot1, this.location_spot2, this.location_line)

    this.location.position.set(1000, 1000, 1000);

    const other_panos_material = new THREE.MeshBasicMaterial({
        color: 0xf0ff20,
        //wireframe: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3

    });
    // this.location = new THREE.Mesh( location_geometry, location_material );
    // this.location.rotation.x = -Math.PI / 2;
    // this.location.position.set(1000, 1000, 1000);

    const plane_geometry = new THREE.PlaneGeometry( 1000, 1000, 100, 100 );
    const plane_material = new THREE.MeshBasicMaterial({
        color: 0xfff00f,
        transparent: true,
        wireframe: true,
        visible:true,
        side: THREE.DoubleSide,
        opacity: 0.1
    });
    this.plane_surf = new THREE.Mesh( plane_geometry, plane_material );
    this.plane_surf.rotation.x = -Math.PI / 2;
    this.plane_surf.position.y = -2;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.context_group = new THREE.Object3D()

    // window.addEventListener('resize', onWindowResize, false);
  },

  methods: {
     load_pano: function(pano_key) {
       this.camera = new THREE.PerspectiveCamera(75, this.$el.clientWidth / this.$el.clientHeight, 1, 1100);
       this.camera.target = new THREE.Vector3(0, 0, 0);
       this.scene = new THREE.Scene();
       this.geometry = new THREE.SphereBufferGeometry(500, 50, 25);
       this.geometry.scale(-1, 1, 1);
       console.log('assign')

       this.loading = true;
       console.log(this.$parent.$options.methods)
       this.$parent.getPanoramaDetails(pano_key).then(this.pano_loaded);

       /*
       let xhr = new XMLHttpRequest();
       let component = this
       xhr.onreadystatechange = function() {
           if (xhr.readyState == XMLHttpRequest.DONE) {
               console.log(xhr.responseText)
               component.panorama_data = JSON.parse(xhr.responseText)
               component.pano_loaded()
           }
       }
       if (pano_key) {
            xhr.open('GET', this.backend + pano_key + '/?apikey=' + this.apikey, true);
       } else {
            xhr.open('GET', require('../assets/panorama.jpg'), true);
       }
       xhr.send(null);
       */
     },

     pano_loaded: function(panorama_data) {
            this.loading = false;
            this.panorama_data = panorama_data
            this.$parent.current_pano = panorama_data
            const component = this
            const texture_loader = new THREE.TextureLoader()
            texture_loader.load(
                this.panorama_data["eqimage"],
                function (texture) {
                    component.applyEqimageMapping(texture)
                },
            undefined,
            function ( err ) {
                console.error( 'An error happened:' );
                console.error( err );
                component.load_pano()
            }
            )
        },

     applyEqimageMapping: function(mapping){

        function format(fmt, ...args){
            return fmt
                .split("%%")
                .reduce((aggregate, chunk, i) =>
                    aggregate + chunk + (args[i] || ""), "");
        }

        this.material = new THREE.MeshBasicMaterial({
            map: mapping,
            side: THREE.DoubleSide
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.y = Math.PI;

        this.scene.add(this.mesh, this.sample_point, this.plane_surf, this.location); //

        this.grid_geometry = new THREE.SphereBufferGeometry(450, 40, 20);
        this.grid_material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xff0000),
            //wireframe: true,
            visible: false,
            side: THREE.DoubleSide
        });
        this.grid_mesh = new THREE.Mesh(this.grid_geometry, this.grid_material);
        this.scene.add(this.grid_mesh);
        if (this.renderer == undefined) {
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.$el.clientWidth, this.$el.clientHeight);
            this.$el.appendChild(this.renderer.domElement)
        }

        this.pano_key = this.panorama_data["id"]
        this.pano_lat = this.panorama_data["lat"]
        this.pano_lon = this.panorama_data["lon"]
        this.pano_track = this.panorama_data["heading"]
        this.utm_code = this.panorama_data["utm_code"]
        this.utm_srid = this.panorama_data["utm_srid"]
        this.utm_x = this.panorama_data["utm_x"]
        this.utm_y = this.panorama_data["utm_y"]

        const filters = format("&dist=200&point=%%,%%",this.pano_lon,this.pano_lat)
        this.$parent.getPanoramas(filters).then(this.contextLoaded);
        this.draw_reference()
        this.enableNavigation()
        this.render()
        this.$parent.$emit('PanoramaUpdated',this.pano_key,this.pano_lon, this.pano_lat, this.utm_x, this.utm_y, this.utm_code)
        this.$parent.$emit('ViewChanged',this.pano_track)

        this.$parent.$on('navigationEnabled', this.enableNavigation)
        this.$parent.$on('navigationDisabled', this.disableNavigation)
     },

     enableNavigation: function() {
       this.$el.addEventListener('mousedown', this.onDocumentMouseDown, false);
       this.$el.addEventListener('mousemove', this.onDocumentMouseMove, false);
       this.$el.addEventListener('mouseup', this.onDocumentMouseUp, false);
       this.$el.addEventListener('mouseout', this.onDocumentMouseUp, false);
       this.$el.addEventListener('wheel', this.onDocumentMouseWheel, false);
       this.$el.addEventListener('dblclick', this.onDocumentDblclick, false);
       this.$el.addEventListener('click', this.onDocumentClick, false);
       this.showCursor(true)
     },

     disableNavigation: function() {
       this.$el.removeEventListener('mousedown', this.onDocumentMouseDown, false);
       this.$el.removeEventListener('mousemove', this.onDocumentMouseMove, false);
       this.$el.removeEventListener('mouseup', this.onDocumentMouseUp, false);
       this.$el.removeEventListener('mouseout', this.onDocumentMouseUp, false);
       this.$el.removeEventListener('wheel', this.onDocumentMouseWheel, false);
       this.$el.removeEventListener('dblclick', this.onDocumentDblclick, false);
       this.$el.removeEventListener('click', this.onDocumentClick, false);
       this.showCursor(false)
     },

     contextLoaded: function(context_data) {
        console.log("context_data viewer: ", context_data["results"])
        const other_panos_material = new THREE.MeshBasicMaterial({
            color: 0xf0ff20,
            //wireframe: true,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });

        this.scene.remove(this.context_group)
        this.context_group = new THREE.Object3D()

        for (var i = 0; i < context_data["count"]; i++) { // (var item in context_data["results"])
            const item = context_data["results"][i]
            let op_geometry = new THREE.CircleGeometry( 1, 32 );
            let op_location = new THREE.Mesh( op_geometry, other_panos_material );
            op_location.rotation.x = -Math.PI / 2;
            op_location.position.set(-(this.utm_y - item.utm_y), -2, -(this.utm_x - item.utm_x))
            console.log(this.utm_x - item.utm_x, this.utm_y - item.utm_y)
            op_location.pano_key = item.id
            this.context_group.add(op_location)
        }
        this.context_group.rotation.y = Math.PI * this.pano_track / 180; // 180:PI=rot:x
        console.log("ROTATION", this.pano_track, Math.PI * this.pano_track / 180)
        this.scene.add(this.context_group)
     },

     draw_reference: function() {
       const control_location_270_geometry = new THREE.Geometry()
       control_location_270_geometry.vertices.push (
         new THREE.Vector3( 0, -2, 0 ),
       	 new THREE.Vector3(  0, -2, -1000 )
       )
       const control_location_270 = new THREE.Line(
           control_location_270_geometry,
           new THREE.LineBasicMaterial({color: 'red', linewidth:4})
       );
       this.scene.add(control_location_270)

       const control_location_90_geometry = new THREE.Geometry()
       control_location_90_geometry.vertices.push (
         new THREE.Vector3( 0, -2, 0 ),
       	 new THREE.Vector3(  0, -2, 1000 )
       )
       const control_location_90 = new THREE.Line(
           control_location_90_geometry,
           new THREE.LineBasicMaterial({color: 'green', linewidth:4})
       );
       this.scene.add(control_location_90)

       const control_location_180_geometry = new THREE.Geometry()
       control_location_180_geometry.vertices.push (
         new THREE.Vector3( 0, -2, 0 ),
       	 new THREE.Vector3(  -1000, -2, 0 )
       )
       const control_location_180 = new THREE.Line(
           control_location_180_geometry,
           new THREE.LineBasicMaterial({color: 'cyan', linewidth:4})
       );
       this.scene.add(control_location_180)

       const control_location_0_geometry = new THREE.Geometry()
       control_location_0_geometry.vertices.push (
         new THREE.Vector3( 0, -2, 0 ),
       	 new THREE.Vector3(  1000, -2, 0 )
       )
       const control_location_0 = new THREE.Line(
           control_location_0_geometry,
           new THREE.LineBasicMaterial({color: 'blue', linewidth:4})
       );
       this.scene.add(control_location_0)

       console.log("draw_reference",control_location_270,control_location_90,control_location_0,control_location_180);
     },

     onDocumentClick: function(event) {
       const rect = this.renderer.domElement.getBoundingClientRect();
       this.mouse.x = ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1;
       this.mouse.y = -((event.clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1;
       this.raycaster.setFromCamera(this.mouse, this.camera);
       const intersect = this.raycaster.intersectObjects([this.context_group],true);
       console.log(intersect[0]);
       console.log(intersect[0].object.pano_key);
       this.load_pano(intersect[0].object.pano_key)
     },

     onDocumentDblclick: function(event) {
       const rect = this.renderer.domElement.getBoundingClientRect();
       this.mouse.x = ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1;
       this.mouse.y = -((event.clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1;
       this.raycaster.setFromCamera(this.mouse, this.camera);
       const intersect = this.raycaster.intersectObject(this.grid_mesh);
       const plane_intersect = this.raycaster.intersectObject(this.plane_surf);
       console.log(intersect[0]);
       let lat_click = 180 * intersect[0].uv.y - 90;
       let lon_click = -(360 * intersect[0].uv.x - this.pano_track);
       if (lon_click < 0) {
           lon_click = 360 + lon_click
       }
       console.log("LAT_LON",lon_click, lat_click);
       console.log("X_Y",plane_intersect[0].point.x, plane_intersect[0].point.y, plane_intersect[0].point.z);
       const geometry = new THREE.Geometry()
       geometry.vertices.push(new THREE.Vector3(intersect[0].point.x, intersect[0].point.y, intersect[0].point.z));
       //???
       this.sample_point.position.set(intersect[0].point.x, intersect[0].point.y, intersect[0].point.z);
     },

     onDocumentMouseUp: function (event) {
       this.isUserInteracting = false;
     },

     onDocumentMouseDown: function (event) {
       event.preventDefault();
       this.isUserInteracting = true;
       this.onMouseDownMouseX = event.clientX;
       this.onMouseDownMouseY = event.clientY;
       this.onMouseDownLon = this.lon;
       this.onMouseDownLat = this.lat;
     },

     onDocumentMouseMove: function (event) {
       if (this.isUserInteracting === true) {
           this.lon = (this.onMouseDownMouseX - event.clientX) * 0.1 + this.onMouseDownLon;
           this.lat = (event.clientY - this.onMouseDownMouseY) * 0.1 + this.onMouseDownLat;
           const center_view = new THREE.Vector2();
           center_view.x = 0;
           center_view.y = 0
           this.raycaster.setFromCamera(center_view, this.camera);
           const intersect = this.raycaster.intersectObject(this.grid_mesh);
           let rotation = -(360 * intersect[0].uv.x - this.pano_track);
           if (rotation < 0) {
               rotation = 360 + rotation
           }
           rotation = rotation - 180
           // map_panel.rotate_pano(container_suff, rotation);
           console.log("rotation",rotation,intersect[0].uv.x);
           this.$parent.$emit('ViewChanged',rotation)

       } else {
           const rect = this.renderer.domElement.getBoundingClientRect();
           this.mouse.x = ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1;
           this.mouse.y = -((event.clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1;
           this.raycaster.setFromCamera(this.mouse, this.camera);
           const intersect = this.raycaster.intersectObject(this.grid_mesh);
           let lat_mouse = 180 * intersect[0].uv.y - 90;
           let lon_mouse = -(360 * intersect[0].uv.x - this.pano_track);
           if (lon_mouse < 0) {
               lon_mouse = 360 + lon_mouse
           }
           if (lat_mouse < -2) {
               const abs_lat = -lat_mouse
               const distance = 473.4301507896*Math.pow(abs_lat, -1.8); // -1.4267930147
               // console.log("D_",distance,lon_mouse);
               // map_panel.cursor_pano(container_suff, lon_mouse, distance);
               lon_mouse = lon_mouse - 180
               this.$parent.$emit('PanoCursorChanged',lon_mouse , distance)
           }
           const plane_intersect = this.raycaster.intersectObject(this.plane_surf);
           if (plane_intersect[0]) {
               this.location.position.set(plane_intersect[0].point.x, plane_intersect[0].point.y+0.1, plane_intersect[0].point.z);
           }

       }
     },

     onDocumentMouseWheel: function (event) {
       const fov = this.camera.fov + event.deltaY;
       this.camera.fov = THREE.Math.clamp(fov, 5, 75);
       this.camera.updateProjectionMatrix();
     },

     render: function () {
       requestAnimationFrame(this.render);
       this.update();
     },

     update: function () {
       this.lat = Math.max(-85, Math.min(85, this.lat));
       const phi = THREE.Math.degToRad(90 - this.lat);
       const theta = THREE.Math.degToRad(this.lon);
       this.camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
       this.camera.target.y = 500 * Math.cos(phi);
       this.camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
       this.camera.lookAt(this.camera.target);
       this.renderer.render(this.scene, this.camera);
     },

     showCursor: function (isVisible) {
         this.location.traverse ( function (child) {
            child.visible = isVisible;
         });
     },

  },

  events: {
  }
}
</script>
