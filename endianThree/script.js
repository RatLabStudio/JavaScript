// Endian Tech Demo using Three.js and Cannon.es
// Copyright Rat Lab One 2023

// TO-DO for v0.1.4:
// Add HUD
// Add commands to console

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { PointerLockControls } from 'PointerLockControls';
import { GLTFLoader } from "GLTFLoader";
import * as CSS3DRenderer from "CSS3DRenderer";
import vCpu from './vcpu.js';

var vCpus = []; // Array of all Visual CPUs in game

let webglContainer = document.getElementById("webgl");
let css3dContainer = document.getElementById("css3d");
let hudContainer = document.getElementById("hud");

// Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
webglContainer.appendChild(renderer.domElement);

// CSS3D Scene
var cssScene = new THREE.Scene();
let cssRenderer = new CSS3DRenderer.CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
css3dContainer.appendChild(cssRenderer.domElement);

window.addEventListener('resize', () => {
    let w = window.innerWidth,
        h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    cssRenderer.setSize(w, h);
});

let controls = new PointerLockControls(camera, renderer.domElement);
let clock = new THREE.Clock();
document.addEventListener("click", function () {
    controls.lock();
});

const physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, -24, 0),
});
var showCollisions = false;
const cannonDebugger = new CannonDebugger(scene, physicsWorld, {});

var objs = [];

class obj {
    constructor(material, mass, shape, geometry, x, y, z, rX, rY, rZ, type, sceneToUse = scene) {
        this.material = material;
        this.mass = mass;
        this.shape = shape;
        this.geometry = geometry;
        this.x = x;
        this.y = y;
        this.z = z;
        this.rX = rX;
        this.rY = rY;
        this.rZ = rZ;
        this.type = type;

        this.body = new CANNON.Body({
            mass: this.mass,
            shape: this.shape,
            type: this.type,
        });
        this.body.position.set(this.x, this.y, this.z);
        physicsWorld.addBody(this.body);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        sceneToUse.add(this.mesh);
        objs.push(this);
    }

    sync() { // Syncs visual and physics worlds
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    update() {
        this.sync();
    }
}

class player extends obj {
    constructor(material, mass, shape, geometry, x, y, z) {
        super(material, mass, shape, geometry, x, y, z, 0, 0, 0);
    }

    update() {
        this.sync();
        camera.position.set(
            this.body.position.x,
            this.body.position.y + 1.5, // The 1.5 offsets the camera up
            this.body.position.z// + 5 // Enables basic 3rd person camera
        );
        this.body.quaternion.x = 0;
        this.body.quaternion.z = 0;
    }
}

function createPathStrings(filename) {
    const basePath = "assets/textures/sky/";
    const baseFilename = basePath + filename;
    const fileType = ".png";
    const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
    const pathStings = sides.map(side => {
        return baseFilename + "_" + side + fileType;
    });

    return pathStings;
}
let skyboxImage = "sky";
function createMaterialArray(filename) {
    const skyboxImagepaths = createPathStrings(filename);
    const materialArray = skyboxImagepaths.map(image => {
        let texture = new THREE.TextureLoader().load(image);

        return texture;
    });
    return materialArray;
}
const materialArray = createMaterialArray(skyboxImage);
var skyboxGeo = new THREE.BoxGeometry(1, 1, 1);
var skybox = new THREE.Mesh(skyboxGeo, materialArray);
//var skybox = new THREE.Mesh(skyboxGeo, new THREE.MeshNormalMaterial())
skybox.position.set(0, 1, 0);
scene.add(skybox);

// Object Creation:
let p = new player(
    new THREE.MeshBasicMaterial(),
    1000,
    new CANNON.Cylinder(1, 1, 4),
    new THREE.CylinderGeometry(1, 1, 4, 100, 100),
    0, 2, 15
);
// Jumping, pulled from https://codepen.io/AdamJames93/pen/vYmJoxX
var canJump = false;
var contactNormal = new CANNON.Vec3();
var upAxis = new CANNON.Vec3(0, 1, 0);
p.body.addEventListener("collide", function (e) {
    var contact = e.contact;
    if (contact.bi.id == p.body.id)
        contact.ni.negate(contactNormal);
    else
        contactNormal.copy(contact.ni);
    if (contactNormal.dot(upAxis) > 0.5) { //Threshhold between 0-1
        canJump = true;
        p.body.velocity.y = 0;
    }
});

var typing = false;
//vCpus.push(new vCpu(0, 2.5, 12.75/*3.6*/, 620, 440, 0/*-0.8*/, scene, cssScene));
vCpus.push(new vCpu(0, 2.5, 3.6, 620, 440, -0.8, scene, cssScene));
vCpus[0].typeString("Visual CPU v3.1");
vCpus[0].type("Enter");
vCpus[0].typeString("2023 Rat Lab");
vCpus[0].type("Enter");
vCpus[0].type("Enter");
vCpus[0].typeString("Press Enter to type");
vCpus[0].type("Enter");

let testCy = new obj(
    new THREE.MeshNormalMaterial(),
    1,
    new CANNON.Cylinder(1, 1, 4),
    new THREE.CylinderGeometry(1, 1, 4, 100, 100),
    5.5, 1, 8,
    0, 0, 0
);

const blackMaterial = new THREE.MeshStandardMaterial();
blackMaterial.color.set(0x000000);
let ground = new obj(
    blackMaterial,
    0,
    new CANNON.Box(new CANNON.Vec3(20, 0.5, 20)),
    new THREE.BoxGeometry(40, 1, 40),
    0, -1, 20,
    0, 0, 0,
    CANNON.Body.STATIC,
);

let testCube = new obj(
    new THREE.MeshNormalMaterial(),
    2,
    new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    new THREE.BoxGeometry(2, 2, 2),
    7, 5, 2,
    0, 0, 0
);

let sphs = [];
for (var i = 0; i < 10; i++) {
    sphs.push(
        new obj(
            new THREE.MeshNormalMaterial, // Material
            5, // Mass
            new CANNON.Sphere(i * 0.2), // Physics Shape
            new THREE.SphereGeometry(i * 0.2), // Geometry
            i * -1, i * 3, i * 2, // Position
            0, 0, 0 // Rotation
        )
    );
}

const light = new THREE.AmbientLight(0xffffff, 2);
light.position.set(0, 10, 14);
light.castShadow = true;
scene.add(light);
const dLight = new THREE.DirectionalLight(0xeeeeff, 15);
dLight.position.set(0, 10, 14);
dLight.castShadow = true;
scene.add(dLight);
let lightObj = new obj(
    new THREE.MeshNormalMaterial(),
    0,
    new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
    new THREE.BoxGeometry(1, 1, 1),
    0, 10, 14,
    0, 0, 0,
)

const loader = new GLTFLoader();
loader.load('assets/models/MainRoom3.gltf', (gltfScene) => {
    //gltfScene.scene.scale.set(1, 1, 1);
    gltfScene.scene.position.x = -5;
    gltfScene.scene.position.z = 15;
    gltfScene.scene.position.y = -2.4;
    gltfScene.scene.receiveShadow = true;
    gltfScene.scene.castShadow = true;
    scene.add(gltfScene.scene);
}, undefined, function (error) {
    console.error(error);
});

var keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
    crouch: false
};
document.addEventListener('keydown', function (e) {
    var k = e.key;

    if (typing) {
        vCpus[0].type(k);
        return;
    }

    if (k == 'Enter') {
        toggleTyping();
        return;
    }

    k = k.toLowerCase();

    if (k == 'w')
        keys.up = true;
    if (k == 'a')
        keys.left = true;
    if (k == 's')
        keys.down = true;
    if (k == 'd')
        keys.right = true;
    if (k == ' ' && canJump) {
        p.body.applyImpulse(new CANNON.Vec3(0, 14000, 0));
        canJump = false;
    }
    if (k == 'shift')
        keys.crouch = true;
    if (k == 'g') {
        if (showCollisions)
            showCollisions = false;
        else
            showCollisions = true;
    }
    if (k == '1')
        toggleOverlay();
    if (k == '`')
        togglePopup('settings');
});
document.addEventListener('keyup', function (e) {
    var k = e.key.toLowerCase();
    if (k == 'w')
        keys.up = false;
    if (k == 'a')
        keys.left = false;
    if (k == 's')
        keys.down = false;
    if (k == 'd')
        keys.right = false;
    if (k == ' ')
        keys.jump = false;
    if (k == 'shift')
        keys.crouch = false;
});

camera.eulerOrder = "YXZ"; // Allows camera to be rotated more easily
function processMovement(delta) {
    let speed = 10;
    let actualSpeed = speed * delta;
    if (keys.up) {
        p.body.position.x -= Math.sin(camera.rotation.y) * actualSpeed;
        p.body.position.z -= Math.cos(camera.rotation.y) * actualSpeed;
    }
    if (keys.down) {
        p.body.position.x += Math.sin(camera.rotation.y) * actualSpeed;
        p.body.position.z += Math.cos(camera.rotation.y) * actualSpeed;
    }
    if (keys.left) {
        p.body.position.x += -Math.sin(camera.rotation.y + Math.PI / 2) * actualSpeed;
        p.body.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * actualSpeed;
    }
    if (keys.right) {
        p.body.position.x += -Math.sin(camera.rotation.y - Math.PI / 2) * actualSpeed;
        p.body.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * actualSpeed;
    }
}

// Render the scene
function render() {
    requestAnimationFrame(render);

    physicsWorld.fixedStep();
    if (showCollisions) cannonDebugger.update(); // Displays Physics World

    processMovement(clock.getDelta());
    updateGUI();

    for (var i = 0; i < objs.length; i++)
        objs[i].update();
    for (var i = 0; i < vCpus.length; i++)
        vCpus[i].redraw(clock.elapsedTime);

    cssRenderer.render(cssScene, camera);
    renderer.render(scene, camera);
}
render();

// 2D Stuff:
var overlayEnabled = true;
function toggleOverlay() {
    if (overlayEnabled) {
        let overlays = document.getElementsByClassName('overlay');
        for (var i = 0; i < overlays.length; i++)
            overlays[i].style.display = 'none';
        overlayEnabled = false;
    }
    else {
        let overlays = document.getElementsByClassName('overlay');
        for (var i = 0; i < overlays.length; i++)
            overlays[i].style.display = 'inline';
        overlayEnabled = true;
    }
}
var rotationEnabled = false;
document.getElementById("XYZ").addEventListener('click', function () {
    if (rotationEnabled) {
        rotationEnabled = false;
    }
    else {
        rotationEnabled = true;
    }
});
function updateGUI() {
    if (!rotationEnabled)
        document.getElementById('XYZ').innerHTML = "XYZ: (" + Math.round(p.body.position.x) + ', ' + Math.round(p.body.position.y) + ', ' + Math.round(p.body.position.z) + ")";
    else {
        let euler = new THREE.Euler();
        let rotation = euler.setFromQuaternion(camera.quaternion);
        let radiansZ = rotation.z > 0
            ? rotation.z
            : (2 * Math.PI) + rotation.z;
        let degreesZ = THREE.Math.radToDeg(radiansZ);
        let radiansX = rotation.x > 0
            ? rotation.x
            : (2 * Math.PI) + rotation.x;
        let degreesX = THREE.Math.radToDeg(radiansX);
        let radiansY = rotation.y > 0
            ? rotation.y
            : (2 * Math.PI) + rotation.y;
        let degreesY = THREE.Math.radToDeg(radiansY);
        document.getElementById('XYZ').innerHTML = "Rotation XYZ: (" + Math.round(degreesX) + ', ' + Math.round(degreesY) + ', ' + Math.round(degreesZ) + ")";
    }
}
function togglePopup(popupName) {
    let popup = document.getElementById(popupName);
    if (popup.style.display == 'none') {
        popup.style.display = 'inline';
        controls.unlock();
    }
    else {
        popup.style.display = 'none';
        controls.lock();
    }
}
let fovSlider = document.getElementById('fovSlider');
fovSlider.addEventListener("input", function (e) {
    let fov = fovSlider.value * 1;
    document.getElementById('fovLabel').innerHTML = 'FOV: ' + fov;
    camera.fov = fov;
    camera.updateProjectionMatrix();
});
document.getElementById('cameraSensitivitySlider').addEventListener("input", function (e) {
    let cameraSensitivity = document.getElementById('cameraSensitivitySlider').value * 1;
    document.getElementById('cameraSensitivityLabel').innerHTML = 'Camera Sensitivity: ' + cameraSensitivity;
    controls.pointerSpeed = cameraSensitivity;
});
function toggleTyping() {
    if (typing)
        typing = false;
    else
        typing = true;
}