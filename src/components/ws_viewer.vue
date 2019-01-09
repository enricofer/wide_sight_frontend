<template>
    <div id="container">
    <div id="labels"></div>
  </div>
</template>

<style>

#container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

#labels {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.overlabel {
  font-family: arial ;
  color: white;
  font-size: 10px;
  z-index: 100;
  left: -100px;
  top: -100px;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

</style>

<script>
/* eslint-disable */
import * as THREE from 'three'

export default {
  name: 'viewer',

  data: function () {
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
      height_from_ground: 2,

      camera: null,
      scene: null,
      geometry: null,
      texture: null,
      material: null,
      mesh: null,
      renderer: null,
      grid_mesh: null,
      tagGeom:null,
      tagObject:null,

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

      options: [
                    {
                        name: 'Duplicate',
                        slug: 'duplicate'
                    },
                    {
                        name: 'Edit',
                        slug: 'edit'
                    },
                    {
                        name: 'Delete',
                        slug: 'delete'
                    }
                ],
    }
  },

  mounted: function () {
    this.load_pano(this.$parent.initialPano)
  },

  created: function () {
     this.parent_initialPano = this.$parent.initialPano
     this.parent_backend = this.$parent.backend
     this.parent_apikey = this.$parent.apikey
     this.backend_link = this.parent_backend+"/panoramas/"+this.parent_initialPano+"/?apikey="+this.parent_apikey

    this.material = undefined

    this.$parent.$on('MapPanelClick', this.load_pano)
    //this.id = this._uid
    let component = this
    // this.sample_point = null
    this.point1_texture = new THREE.TextureLoader()
    require('../assets/marker.png')
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
    this.location_spot2.position.set(0, 0.01, 0);
    this.location_spot2.rotation.x = -Math.PI / 2;
    const location_line_geometry = new THREE.Geometry();
    const location_line_material = new THREE.LineDashedMaterial({
        color: 0xffffff,
        linewidth: 4,
        scale: 1,
        dashSize: 2,
        gapSize: 2,
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

    this.tagMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 4 } );
    this.loadedtagsMaterial = new THREE.LineBasicMaterial( { color: 0xff00ff, linewidth: 4 } );
    this.contextMaterial = new THREE.LineBasicMaterial( { color: 0xffff00, linewidth: 2 } );
    this.tagObject = new THREE.Line( this.tagGeom,  this.tagMaterial );


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
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.other_panos_group = new THREE.Object3D()

    // window.addEventListener('resize', onWindowResize, false);
  },

  methods: {
     load_pano: function(pano_key) {
       this.camera = new THREE.PerspectiveCamera(50, this.$el.clientWidth / this.$el.clientHeight, 1, 1100);
       this.camera.target = new THREE.Vector3(0, 0, 0);
       this.scene = new THREE.Scene();
       this.geometry = new THREE.SphereBufferGeometry(500, 50, 25);
       this.geometry.scale(-1, 1, 1);

       this.loading = true;
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

        if (this.material) {
            this.material.dispose()
        }

        this.material = new THREE.MeshBasicMaterial({
            map: mapping,
            side: THREE.DoubleSide
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.y = Math.PI;
        this.scene.add(this.mesh, this.sample_point, this.plane_surf, this.location); //

        this.panoTagsGroup = new THREE.Group();
        this.scene.add(this.panoTagsGroup);

        this.contextGroup = new THREE.Group();
        this.scene.add(this.contextGroup);

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
            this.renderer = new THREE.WebGLRenderer(); //SoftwareRenderer();
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
        if (this.panorama_data["height_from_ground"]) {
            this.height_from_ground = this.panorama_data["height_from_ground"]
        } else {
            this.height_from_ground = 2
        }
        this.plane_surf.position.y = -this.height_from_ground;


        if (this.lat && this.lon) {
          console.log("EMIT to keymap")
          this.render();
          this.emitViewChanged();
        }

        const filters = format("&dist=200&point=%%,%%",this.pano_lon,this.pano_lat)
        this.$parent.getPanoramas(filters).then(this.otherPanosLoaded);

        this.restoreTags();
        this.draw_reference()
        this.enableNavigation()
        this.render()

        this.$parent.$on('context_redraw', this.redrawContext)
        this.$parent.$emit('PanoramaUpdated',this.pano_key,this.pano_lon, this.pano_lat, this.utm_x, this.utm_y, this.utm_code, this.utm_zone)

        this.$parent.$on('navigationEnabled', this.enableNavigation)
        this.$parent.$on('navigationDisabled', this.disableNavigation)

        this.$parent.$on('taggingEnabled', this.enableTagging)
        this.$parent.$on('taggingDisabled', this.disableTagging)

        this.$parent.$on('tag_deleted', this.restoreTags)
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

     enableTagging: function() {
       this.$el.addEventListener('click', this.onTagClick, false);
       this.$el.addEventListener('dblclick', this.onTagDblClick, false);
       this.$el.addEventListener('mousemove', this.onTagMouseMove, false);
       this.taggingInit();
     },

     disableTagging: function() {
       this.$el.removeEventListener('click', this.onTagClick, false);
       this.$el.removeEventListener('dblclick', this.onTagDblClick, false);
       this.$el.removeEventListener('mousemove', this.onTagMouseMove, false);
       this.taggingInit();
     },

     otherPanosLoaded: function(other_panos_data) {
        const other_panos_material = new THREE.MeshBasicMaterial({
            color: 0xf0ff20,
            //wireframe: true,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });

        this.scene.remove(this.other_panos_group)
        this.other_panos_group = new THREE.Object3D()

        for (var i = 0; i < other_panos_data["count"]; i++) { // (var item in context_data["results"])
            const item = other_panos_data["results"][i]
            let op_geometry = new THREE.CircleGeometry( 1, 32 );
            let op_location = new THREE.Mesh( op_geometry, other_panos_material );
            op_location.rotation.x = -Math.PI / 2;
            op_location.position.set(-(this.utm_y - item.utm_y), -this.height_from_ground, -(this.utm_x - item.utm_x))
            op_location.pano_key = item.id
            this.other_panos_group.add(op_location)
        }
        this.other_panos_group.rotation.y = Math.PI * this.pano_track / 180; // 180:PI=rot:x
        this.scene.add(this.other_panos_group)
     },

     draw_reference: function() {
       const control_location_270_geometry = new THREE.Geometry()
       control_location_270_geometry.vertices.push (
         new THREE.Vector3( 0, -this.height_from_ground, 0 ),
       	 new THREE.Vector3(  0, -this.height_from_ground, -1000 )
       )
       const control_location_270 = new THREE.Line(
           control_location_270_geometry,
           new THREE.LineBasicMaterial({color: 'red', linewidth:4})
       );
       this.scene.add(control_location_270)

       const control_location_90_geometry = new THREE.Geometry()
       control_location_90_geometry.vertices.push (
         new THREE.Vector3( 0, -this.height_from_ground, 0 ),
       	 new THREE.Vector3(  0, -this.height_from_ground, 1000 )
       )
       const control_location_90 = new THREE.Line(
           control_location_90_geometry,
           new THREE.LineBasicMaterial({color: 'green', linewidth:4})
       );
       this.scene.add(control_location_90)

       const control_location_180_geometry = new THREE.Geometry()
       control_location_180_geometry.vertices.push (
         new THREE.Vector3( 0, -this.height_from_ground, 0 ),
       	 new THREE.Vector3(  -1000, -this.height_from_ground, 0 )
       )
       const control_location_180 = new THREE.Line(
           control_location_180_geometry,
           new THREE.LineBasicMaterial({color: 'cyan', linewidth:4})
       );
       this.scene.add(control_location_180)

       const control_location_0_geometry = new THREE.Geometry()
       control_location_0_geometry.vertices.push (
         new THREE.Vector3( 0, -this.height_from_ground, 0 ),
       	 new THREE.Vector3(  1000, -this.height_from_ground, 0 )
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
       const intersect = this.raycaster.intersectObjects([this.other_panos_group],true);
       console.log(intersect[0]);
       if (intersect[0]) {
           console.log(intersect[0].object.pano_key);
           this.load_pano(intersect[0].object.pano_key)
       }
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

     emitViewChanged: function () {
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
         this.$parent.$emit('ViewChanged',rotation)
     },

     onDocumentMouseMove: function (event) {
       if (this.isUserInteracting === true) {
           this.lon = (this.onMouseDownMouseX - event.clientX) * 0.1 + this.onMouseDownLon;
           this.lat = (event.clientY - this.onMouseDownMouseY) * 0.1 + this.onMouseDownLat;
           this.emitViewChanged();
           this.refreshLabels();

       } else {
           const rect = this.renderer.domElement.getBoundingClientRect();
           this.mouse.x = ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1;
           this.mouse.y = -((event.clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1;
           console.log(this.mouse.x, this.mouse.y)
           this.raycaster.setFromCamera(this.mouse, this.camera);
           /*
           const intersect = this.raycaster.intersectObject(this.grid_mesh);
           let lat_mouse = 180 * intersect[0].uv.y - 90;
           let lon_mouse = -(360 * intersect[0].uv.x - this.pano_track);
           if (lon_mouse < 0) {
               lon_mouse = 360 + lon_mouse
           }
           if (lat_mouse < -2) {
               const abs_lat = -lat_mouse
               const distance = 473.4301507896*Math.pow(abs_lat, -1.4); // -1.4267930147
               // console.log("D_",distance,lon_mouse);
               // map_panel.cursor_pano(container_suff, lon_mouse, distance);
               lon_mouse = lon_mouse - 180
               //this.$parent.$emit('PanoCursorChanged',lon_mouse , distance)
           }
           */
           const plane_intersect = this.raycaster.intersectObject(this.plane_surf);
           if (plane_intersect[0]) {
               console.log(plane_intersect[0].point.x,plane_intersect[0].point.y,plane_intersect[0].point.z)
               const back_rotation = - Math.PI * this.pano_track / 180;
               const back_x = plane_intersect[0].point.z * Math.cos(back_rotation) - plane_intersect[0].point.x * Math.sin(back_rotation);
               const back_y = plane_intersect[0].point.x * Math.cos(back_rotation) + plane_intersect[0].point.z * Math.sin(back_rotation);
               this.$parent.$emit('PanoCursorChanged',back_x , back_y)
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

    taggingInit: function() {
      this.tagShape = undefined;
      this.scene.remove(this.tagObject);
    },

    onTagClick: function(event) {
       if (event.button == 2) {
           this.storeTag()
       } else {
            if (this.tagShape){
                this.tagObject.geometry.dispose();
                //this.scene.remove(this.tagObject);
            } else {
                this.tagShape = [];
                this.tagGeom = new THREE.Geometry();
                this.scene.add(this.tagObject);
                this.lastPoint = undefined;
                this.startPoint = undefined;
            }
            const intersect = this.getEquirectIntObj(event);
            const clickedPoint = new THREE.Vector3(intersect[0].point.x, intersect[0].point.y, intersect[0].point.z)
            if (!this.startPoint) {
              this.startPoint = clickedPoint;
            }
            this.tagGeom.vertices.push(clickedPoint);
            this.tagShape.push([intersect[0].uv.x,intersect[0].uv.y]);
            console.log("GEOM",intersect[0].point.x, intersect[0].point.y, intersect[0].point.z);
            const polyGeom = this.tagGeom.clone();
            polyGeom.vertices.push(this.startPoint);
            this.tagObject.geometry = polyGeom;
            this.renderer.render(this.scene, this.camera);

       }
     },

    onTagMouseMove: function(event) {
        if (this.tagShape){
            const intersect = this.getEquirectIntObj(event);
            const movedPoint = new THREE.Vector3(intersect[0].point.x, intersect[0].point.y, intersect[0].point.z)
            const polyGeom = this.tagGeom.clone();
            polyGeom.vertices.push(movedPoint,this.startPoint);
            this.tagObject.geometry = polyGeom.clone();
        }
    },

    onTagDblClick: function(event) {
        this.storeTag()
        this.scene.remove(this.tagObject);
    },

    getEquirectIntObj: function (event) {
         const rect = this.renderer.domElement.getBoundingClientRect();
         this.mouse.x = ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1;
         this.mouse.y = -((event.clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1;
         this.raycaster.setFromCamera(this.mouse, this.camera);
         return this.raycaster.intersectObject(this.grid_mesh);
    },

    storeTag: function() {

        const update_url = this.parent_backend+"/image_objects/?apikey="+this.parent_apikey;
        const component = this

        $.ajax({
              type: 'POST',
              url: update_url,
              data: {
                panorama: this.pano_key,
                type: 1,
                creator_key: this.parent_apikey,
                geom_on_panorama: JSON.stringify(this.tagShape),

              },
              dataType: "application/json",
              //need to catch 201 http code
              success: function(resultData) { console.log("OK", resultData); },
              error: function(errormsg) {
                  if (errormsg["status"] == 201) {
                        component.restoreTags()
                        const createdKey = JSON.parse(errormsg["responseText"])["id"]
                        component.$parent.$emit('editTag', createdKey)
                    } else {
                        console.log("ERROR", errormsg);
                    }
                  },
        });

        this.tagShape = undefined

      },

    removeTags: function() {
      for (var i = this.panoTagsGroup.children.length - 1; i >= 0; i--) {
          this.panoTagsGroup.remove(this.panoTagsGroup.children[i]);
      }
      this.removeLabels()
    },

    restoreTags: function() {

        const convert2d3d = function (r, x, y) {
            let lat  = y  * Math.PI - Math.PI / 2;
            let long = x * 2 * Math.PI - Math.PI;

            return {
                x: r * Math.cos(lat) * Math.cos(long),
                y: r * Math.sin(lat),
                z: - r * Math.cos(lat) * Math.sin(long),
            }
        }

        const retrieve_url = this.parent_backend+"/image_objects/?apikey="+this.parent_apikey+"&type=1&panorama="+this.pano_key;
        const component = this
        $.ajax({
              type: 'GET',
              url: retrieve_url,
              error: function(errormsg) { console.log("ERROR", errormsg);},
              success: function(resultData) {
                  component.removeTags();
                  component.scene.remove(component.panoTagsGroup)
                  let startVertex;
                  for (var i=0; i<resultData["results"].length; ++i) {
                    const item = resultData["results"][i];
                    const tag_geom = JSON.parse(item["geom_on_panorama"]);
                    const tagShape = new THREE.Geometry();
                    for (var v=0; v<tag_geom.length; ++v) {
                      const vertex = convert2d3d(450, tag_geom[v][0], tag_geom[v][1]);
                      if (!startVertex) {
                        startVertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z)
                      }
                      tagShape.vertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z))
                    }
                    tagShape.vertices.push(startVertex);
                    const newTagObject = new THREE.Line( tagShape,  component.loadedtagsMaterial );
                    component.panoTagsGroup.add(newTagObject);
                    component.scene.add(component.panoTagsGroup);

                    newTagObject.label = component.createLabel(item.id)

                    newTagObject.toScreenXY = function () {
                        this.geometry.computeBoundingBox()
                        var pos = new THREE.Vector3();
                        this.geometry.boundingBox.getCenter(pos);
                        var projScreenMat = new THREE.Matrix4();
                        projScreenMat.multiplyMatrices(component.camera.projectionMatrix, component.camera.matrixWorldInverse);
                        var frustum = new THREE.Frustum();
                        frustum.setFromMatrix(projScreenMat)
                        if (frustum.containsPoint(pos)) {
                          pos.applyMatrix4(projScreenMat);
                          return { x: ( pos.x + 1 ) * component.$el.clientWidth/ 2 + component.$el.offsetLeft,
                              y: ( - pos.y + 1) * component.$el.clientHeight / 2 + component.$el.offsetTop };
                        } else {
                          return { x: -100, y:-100}
                        }
                    }

                    newTagObject.refreshLabel = function () {
                        const screenPosition = this.toScreenXY()
                        this.label.style.left = screenPosition.x + 'px';
                        this.label.style.top = screenPosition.y + 'px';
                    }

                    startVertex = undefined;
                  }

                  component.refreshLabels()
              },
        });
    },

    createLabel: function (text) {
      const component = this
      const textElement = document.createElement( 'div' );
      textElement.style.position = 'absolute';
      textElement.classList.add("overlabel");
      textElement.onclick = function (event) {
          event.preventDefault()
          console.log("TAG",text)
          component.$parent.$emit('editTag', text)
      }
      textElement.innerHTML = text;
      document.getElementById("labels").appendChild(textElement)
      return textElement
    },

    removeLabels: function () {
      $('.overlabel').remove();
    },

    refreshLabels: function () {
      for ( var i = 0; i < this.panoTagsGroup.children.length; i ++ ) {
          const tagObj = this.panoTagsGroup.children[i]
          tagObj.refreshLabel()
      }
    },

    redrawContext: function(context) {
        console.log("REDRAW CONTEXT")

        //remove contextGroup
        for (var i = this.contextGroup.children.length - 1; i >= 0; i--) {
            this.contextGroup.remove(this.contextGroup.children[i]);
        }
        this.scene.remove(this.contextGroup)

        for (var i=0; i<context.length; ++i) {
            const map_feat = context[i];
            let startVertex;
            const contextShape = new THREE.Geometry();
            for (var k=0; k<map_feat["geometry"]["coordinates"][0][0].length; ++k) {
                const vertex = new THREE.Vector3(
                    map_feat["geometry"]["coordinates"][0][0][k][1]-this.utm_y,
                    -this.height_from_ground,
                    map_feat["geometry"]["coordinates"][0][0][k][0]-this.utm_x,
                );

                if (!startVertex){
                    startVertex = vertex
                }
                contextShape.vertices.push(vertex)
            }
            contextShape.vertices.push(startVertex);
            const newContextObject = new THREE.Line( contextShape,  this.contextMaterial );
            this.contextGroup.add(newContextObject);
        }
        this.contextGroup.rotation.y = Math.PI * this.pano_track / 180;
        this.scene.add(this.contextGroup);
        console.log("contextGroup objs:",this.contextGroup.children.length)


    }

  },


  events: {
  }
}
</script>
