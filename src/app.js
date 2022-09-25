// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Loader } from '@googlemaps/js-api-loader';
//import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import data from './data.json' assert { type: 'JSON' };
var dev = "dev7";
let activity = data[dev][0]["Activity"];

console.log("Activity is " + activity);

 
const apiOptions = {
  apiKey: "AIzaSyCvJGeaLvGav4jivbUd7wpPX_ngz8vPHR8",
  version: "beta"
};

const mapOptions = {
  "tilt": 0,
  "heading": 0,
  "zoom": 21,
  "center": { lat: 35.65947, lng: 139.69999 },
  "mapId": "84538021ece989f0"    
}

async function initMap() {    
  const mapDiv = document.getElementById("map");
  const apiLoader = new Loader(apiOptions);
  await apiLoader.load();
  return new google.maps.Map(mapDiv, mapOptions);
}


function initWebGLOverlayView(map) {  
  let scene, renderer, camera, loader;
  const webGLOverlayView = new google.maps.WebGLOverlayView();
  
  webGLOverlayView.onAdd = () => {   

    

    // set up the scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.75 ); // soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
    
    
    
    // load the model    
      if(activity=="swimming"){
        loader = new GLTFLoader();               
    const source = "temp/swim.gltf";
    loader.load(
      source,
      gltf => {      
        gltf.scene.scale.set(1,1,1);
        
        gltf.scene.rotation.x = 0 * Math.PI/180; // rotations are in radians
        gltf.scene.rotation.y = 0* Math.PI/180;
        gltf.scene.rotation.z = 90 * Math.PI/180;
        scene.add(gltf.scene);           
      }
    );
      }
      else if(activity=="walking"){
        loader = new GLTFLoader();               
        const source = "temp/male.gltf";
        loader.load(
        source,
        gltf => {      
        gltf.scene.scale.set(7,7,7);
        
        gltf.scene.rotation.x = -180 * Math.PI/180; // rotations are in radians
        gltf.scene.rotation.y = 270* Math.PI/180;
        gltf.scene.rotation.z = 90 * Math.PI/180;
        scene.add(gltf.scene);           
      }
    );
    }else if(activity=="runnning"){
      loader = new GLTFLoader();               
    const source = "temp/run.gltf";
    loader.load(
      source,
      gltf => {      
        gltf.scene.scale.set(0.08,0.08,0.08);
        gltf.scene.rotation.x = -180 * Math.PI/180; // rotations are in radians
        gltf.scene.rotation.y = 270* Math.PI/180;
        gltf.scene.rotation.z = 90 * Math.PI/180;
        scene.add(gltf.scene);           
      }
    );
    }else if(activity=="cycling"){
      loader = new GLTFLoader();               
      const source = "temp/cycling.gltf";
      loader.load(
        source,
        gltf => {      
          gltf.scene.scale.set(25,25,25);
          
          gltf.scene.rotation.x = -180 * Math.PI/180; // rotations are in radians
          gltf.scene.rotation.y = 270* Math.PI/180;
          gltf.scene.rotation.z = 90 * Math.PI/180;
          scene.add(gltf.scene);           
        }
      );
      
      
    }else if(activity=="driving"){
      loader = new GLTFLoader();               
    const source = "temp/car.gltf";
    loader.load(
      source,
      gltf => {      
        gltf.scene.scale.set(10,10,10);
        
        gltf.scene.rotation.x = 90 * Math.PI/180; // rotations are in radians
        gltf.scene.rotation.y = 180* Math.PI/180;
        gltf.scene.rotation.z = 0 * Math.PI/180;
        scene.add(gltf.scene);          
      }
    );
    }else{
      loader = new GLTFLoader();               
        const source = "temp/male.gltf";
        loader.load(
          source,
          gltf => {      
            gltf.scene.scale.set(7,7,7);
            
            gltf.scene.rotation.x = -180 * Math.PI/180; // rotations are in radians
            gltf.scene.rotation.y = 270* Math.PI/180;
            gltf.scene.rotation.z = 90 * Math.PI/180;
            scene.add(gltf.scene);
                     
          }
        );
    }

    }    
    
  
    
  webGLOverlayView.onContextRestored = ({gl}) => {    
    // create the three.js renderer, using the
    // maps's WebGL rendering context.
    renderer = new THREE.WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;

    // wait to move the camera until the 3D model loads    
    loader.manager.onLoad = () => {        
      renderer.setAnimationLoop(() => {
        map.moveCamera({
          "tilt": mapOptions.tilt,
          "heading": mapOptions.heading,
          "zoom": mapOptions.zoom
        });          
        
        // rotate the map 360 degrees 
        if (mapOptions.tilt < 67.5) {
          mapOptions.tilt += 0.5
        } else if (mapOptions.heading <= 360) {
          mapOptions.heading += 0.2;
        } else {
          renderer.setAnimationLoop(null)
        }
      });       
    }
   }

  webGLOverlayView.onDraw = ({gl, transformer}) => {
    // update camera matrix to ensure the model is georeferenced correctly on the map
    const latLngAltitudeLiteral = {
        lat: mapOptions.center.lat,
        lng: mapOptions.center.lng,
        altitude: 0
    }

    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
    
    webGLOverlayView.requestRedraw();      
    renderer.render(scene, camera);                  

    // always reset the GL state
    renderer.resetState();
  }
  webGLOverlayView.setMap(map);
}

(async () => {        
  const map = await initMap();
  initWebGLOverlayView(map);    
})();

