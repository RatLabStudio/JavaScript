import * as THREE from 'three';

import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export default class WorldScene extends THREE.Scene {
    private readonly mtlLoader = new MTLLoader();
    private readonly objLoader = new OBJLoader();

    private readonly camera: THREE.PerspectiveCamera;
    private readonly renderer: THREE.WebGLRenderer;

    public controls: PointerLockControls;

    private readonly keyDown = new Set<string>();

    private blaster?: THREE.Group;

    private room?: THREE.Group;

    private directionVector = new THREE.Vector3();

    private targets: THREE.Group[] = [];

    constructor(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
        super();
        this.renderer = renderer;
        this.camera = camera;
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
    }

    async initialize() {
        // load a shared MTL (Material Template Library) for the targets
        const targetMtl = await this.mtlLoader.loadAsync('assets/targetA.mtl');
        targetMtl.preload();

        // create the 4 targets
        const t1 = await this.createTarget(targetMtl);
        t1.position.x = -1;
        t1.position.z = -3;

        const t2 = await this.createTarget(targetMtl);
        t2.position.x = 1;
        t2.position.z = -3;

        const t3 = await this.createTarget(targetMtl);
        t3.position.x = 2;
        t3.position.z = -3;

        const t4 = await this.createTarget(targetMtl);
        t4.position.x = -2;
        t4.position.z = -3;

        this.add(t1, t2, t3, t4);
        this.targets.push(t1, t2, t3, t4);

        this.blaster = await this.createBlaster();
        //this.add(this.blaster);

        this.blaster.position.z = 3;
        this.blaster.add(this.camera);

        this.room = await this.createRoom();
        this.add(this.room)
        this.room.position.y = -5;
        this.room.position.x = -5;

        this.camera.position.z = 0.8;
        this.camera.position.y = 0.5;
        this.camera.position.x = -0.5

        const light = new THREE.DirectionalLight(0xFFFFFF, 1);
        light.position.set(0, 4, 2);

        this.add(light);

        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keyDown.add(event.key.toLowerCase());
    }

    private handleKeyUp = (event: KeyboardEvent) => {
        this.keyDown.delete(event.key.toLowerCase());
    }

    private updateRotation() {
        if (!this.blaster)
            return;
        /*this.blaster.rotation.x = this.camera.rotation.x;
        this.blaster.rotation.y = this.camera.rotation.y;
        this.blaster.rotation.z = this.camera.rotation.z;*/
    }

    private updateInput() {
        if (!this.blaster) {
            return;
        }

        const dir = this.directionVector;

        this.camera.getWorldDirection(dir);

        const speed = 0.1;

        const strafeDir = dir.clone();
        const upVector = new THREE.Vector3(0, 1, 0);

        if (this.keyDown.has('w') || this.keyDown.has('arrowup')) {
            let tempY = this.blaster.position.y;
            this.blaster.position.add(dir.clone().multiplyScalar(speed));
            this.blaster.position.y = tempY;
        }
        else if (this.keyDown.has('s') || this.keyDown.has('arrowdown')) {
            let tempY = this.blaster.position.y;
            this.blaster.position.add(dir.clone().multiplyScalar(-speed));
            this.blaster.position.y = tempY;
        }
        if (this.keyDown.has('a') || this.keyDown.has('arrowleft')) {
            let tempY = this.blaster.position.y;
            this.blaster.position.add(
                strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
                    .multiplyScalar(speed)
            );
            this.blaster.position.y = tempY;
        }
        else if (this.keyDown.has('d') || this.keyDown.has('arrowright')) {
            let tempY = this.blaster.position.y;
            this.blaster.position.add(
                strafeDir.applyAxisAngle(upVector, Math.PI * -0.5)
                    .multiplyScalar(speed)
            );
            this.blaster.position.y = tempY;
        }
    }

    private async createTarget(mtl: MTLLoader.MaterialCreator) {
        this.objLoader.setMaterials(mtl);

        const modelRoot = await this.objLoader.loadAsync('assets/targetA.obj');

        modelRoot.rotateY(Math.PI * 0.5);

        return modelRoot;
    }

    private async createBlaster() {
        const mtl = await this.mtlLoader.loadAsync('assets/blasterH.mtl');
        mtl.preload();

        this.objLoader.setMaterials(mtl);

        const modelRoot = await this.objLoader.loadAsync('assets/blasterH.obj');

        return modelRoot;
    }

    private async createRoom() {
        const mtl = await this.mtlLoader.loadAsync('assets/MainRoom3.mtl');
        mtl.preload();

        this.objLoader.setMaterials(mtl);

        const modelRoot = await this.objLoader.loadAsync('assets/MainRoom3.obj');

        return modelRoot;
    }

    update() {
        this.updateRotation();
        this.updateInput();
    }
}