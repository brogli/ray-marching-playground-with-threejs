"use strict";
// import * as THREE from '../node_modules/three/src/Three.js';
import * as THREE from '../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { Vector3 } from '../node_modules/three/src/Three.js';

const scene = new THREE.Scene();


/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);


/**
 * camera
 */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;
// camera controls
const camControls = new OrbitControls(camera, renderer.domElement);
// camControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
// camControls.dampingFactor = 0.05;
// camControls.screenSpacePanning = false;
// camControls.minDistance = 3;
// camControls.maxDistance = 500;
// camControls.maxPolarAngle = Math.PI / 2;

//used only to render the scene

const renderCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);


/**
 * raymarching stuff
 */

// add viewplane
const viewPlane = new THREE.BufferGeometry();
viewPlane.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
const viewPlaneMesh = new THREE.Mesh(viewPlane, null);
scene.add(viewPlaneMesh);

const target = new THREE.Vector3();

function setFragmentShader(fragmentShader, callback) {

    // this.startTime = Date.now();
    viewPlaneMesh.material = new THREE.ShaderMaterial({

        uniforms: {
            resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            // time:{ type:"f", value:0 },
            // randomSeed:{ type:"f", value:Math.random() },
            fov: { type: "f", value: 45 },
            camera: { type: "v3", value: camera.position },
            target: { type: "v3", value: target },
            // raymarchMaximumDistance:{ type:"f", value:this.distance },
            // raymarchPrecision:{ type:"f", value:this.precision}
        },
        vertexShader: "void main() {gl_Position =  vec4( position, 1.0 );}",
        fragmentShader: fragmentShader,
        transparent: true
    });
    // this.update();

    if (callback != null) callback(this);
}


function loadFragmentShader(fragmentUrl, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", fragmentUrl);
    request.onload = function (e) {
        setFragmentShader(e.target.responseText, callback);
    };
    request.send();
}

function update() {

    if (viewPlaneMesh.material == null) return;

    //     this.material.uniforms.time.value = ( Date.now() - this.startTime ) * .001;
    //     this.material.uniforms.randomSeed.value = Math.random();

    viewPlaneMesh.material.uniforms.fov.value = camera.fov * Math.PI / 180;

    //    this.material.uniforms.raymarchMaximumDistance.value = this.distance;
    //    this.material.uniforms.raymarchPrecision.value = this.precision;

    viewPlaneMesh.material.uniforms.camera.value = camera.position;

    viewPlaneMesh.material.uniforms.target.value = target;
    camera.lookAt(target);

}


/**
 * animate and render
 */
function animate() {
    requestAnimationFrame(animate);
    camControls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    update();
    render();
}

function render() {
    renderer.render(scene, renderCamera);
}

loadFragmentShader("../glsl/simple.glsl", animate);