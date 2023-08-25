import * as THREE from 'three';
import BlasterScene from './BlasterScene';
import WorldScene from './WorldScene';

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('app') as HTMLCanvasElement
});
renderer.setSize(width, height);

const mainCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);

document.addEventListener("click", function () {
  scene.controls.lock();
});

const scene = new WorldScene(renderer, mainCamera);
scene.initialize();

function tick() {
  scene.update();
  
  renderer.render(scene, mainCamera);
  requestAnimationFrame(tick);
}
tick();