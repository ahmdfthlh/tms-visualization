import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/js/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a grid as the ground
const gridHelper = new THREE.GridHelper(10, 10); // Grid 10x10
scene.add(gridHelper);

// Set the camera position
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// Initialize OrbitControls to allow camera rotation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth animation
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls every frame
    renderer.render(scene, camera);
}

animate();
