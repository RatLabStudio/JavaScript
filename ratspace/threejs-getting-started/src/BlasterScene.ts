import * as THREE from 'three';

import Bullet from './Bullet';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export default class BlasterScene extends THREE.Scene {
    private readonly mtlLoader = new MTLLoader()
    private readonly objLoader = new OBJLoader()

    private readonly camera: THREE.PerspectiveCamera;
    private readonly renderer: THREE.WebGLRenderer;

    public controls: PointerLockControls;

    private readonly keyDown = new Set<string>()

    private blaster?: THREE.Group
    private bulletMtl?: MTLLoader.MaterialCreator

    private directionVector = new THREE.Vector3()

    private bullets: Bullet[] = []
    private targets: THREE.Group[] = []

    constructor(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
        super()
        this.renderer = renderer;
        this.camera = camera
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
    }

    async initialize() {
        // load a shared MTL (Material Template Library) for the targets
        const targetMtl = await this.mtlLoader.loadAsync('assets/targetA.mtl')
        targetMtl.preload()

        this.bulletMtl = await this.mtlLoader.loadAsync('assets/foamBulletB.mtl')
        this.bulletMtl.preload()

        this.blaster = await this.createBlaster()
        this.add(this.blaster)

        this.blaster.position.z = 3
        this.blaster.add(this.camera)

        this.camera.position.z = 1
        this.camera.position.y = 0.5

        const light = new THREE.DirectionalLight(0xFFFFFF, 1)
        light.position.set(0, 4, 2)

        this.add(light)

        document.addEventListener('keydown', this.handleKeyDown)
        document.addEventListener('keyup', this.handleKeyUp)
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keyDown.add(event.key.toLowerCase())
    }

    private handleKeyUp = (event: KeyboardEvent) => {
        this.keyDown.delete(event.key.toLowerCase())

        if (event.key === ' ') {
            this.createBullet()
        }
    }

    private updateBlasterRotation() {

    }

    private updateInput() {
        if (!this.blaster) {
            return;
        }

        const shiftKey = this.keyDown.has('shift')

        const dir = this.directionVector

        this.camera.getWorldDirection(dir)

        const speed = 0.1

        if (this.keyDown.has('w') || this.keyDown.has('arrowup')) {
            let tempY = this.blaster.position.y;
            this.blaster.position.add(dir.clone().multiplyScalar(speed))
            this.blaster.position.y = tempY;
        }
        else if (this.keyDown.has('s') || this.keyDown.has('arrowdown')) {
            let tempY = this.blaster.position.y;
            this.blaster.position.add(dir.clone().multiplyScalar(-speed))
            this.blaster.position.y = tempY;
        }
        if (this.keyDown.has('a') || this.keyDown.has('arrowleft')) {
            this.blaster.position.x -= speed;
        }
        else if (this.keyDown.has('d') || this.keyDown.has('arrowright')) {
            this.blaster.position.x += speed;
        }
        const strafeDir = dir.clone()
        const upVector = new THREE.Vector3(0, 1, 0)
    }

    private async createTarget(mtl: MTLLoader.MaterialCreator) {
        this.objLoader.setMaterials(mtl)

        const modelRoot = await this.objLoader.loadAsync('assets/targetA.obj')

        modelRoot.rotateY(Math.PI * 0.5)

        return modelRoot
    }

    private async createBlaster() {
        const mtl = await this.mtlLoader.loadAsync('assets/blasterH.mtl')
        mtl.preload()

        this.objLoader.setMaterials(mtl)

        const modelRoot = await this.objLoader.loadAsync('assets/blasterH.obj')

        return modelRoot
    }

    private async createBullet() {
        if (!this.blaster) {
            return
        }

        if (this.bulletMtl) {
            this.objLoader.setMaterials(this.bulletMtl)
        }

        const bulletModel = await this.objLoader.loadAsync('assets/foamBulletB.obj')

        this.camera.getWorldDirection(this.directionVector)

        const aabb = new THREE.Box3().setFromObject(this.blaster)
        const size = aabb.getSize(new THREE.Vector3())

        const vec = this.blaster.position.clone()
        vec.y += 0.06

        bulletModel.position.add(
            vec.add(
                this.directionVector.clone().multiplyScalar(size.z * 0.5)
            )
        )

        // rotate children to match gun for simplicity
        bulletModel.children.forEach(child => child.rotateX(Math.PI * -0.5))

        // use the same rotation as as the gun
        bulletModel.rotation.copy(this.blaster.rotation)

        this.add(bulletModel)

        const b = new Bullet(bulletModel)
        b.setVelocity(
            this.directionVector.x * 0.2,
            this.directionVector.y * 0.2,
            this.directionVector.z * 0.2
        )

        this.bullets.push(b)
    }

    private updateBullets() {
        for (let i = 0; i < this.bullets.length; ++i) {
            const b = this.bullets[i]
            b.update()

            if (b.shouldRemove) {
                this.remove(b.group)
                this.bullets.splice(i, 1)
                i--
            }
            else {
                for (let j = 0; j < this.targets.length; ++j) {
                    const target = this.targets[j]
                    if (target.position.distanceToSquared(b.group.position) < 0.05) {
                        this.remove(b.group)
                        this.bullets.splice(i, 1)
                        i--

                        target.visible = false
                        setTimeout(() => {
                            target.visible = true
                        }, 1000)
                    }
                }
            }
        }
    }

    update() {
        // update
        this.updateBlasterRotation();
        this.updateInput()
        this.updateBullets()
    }
}