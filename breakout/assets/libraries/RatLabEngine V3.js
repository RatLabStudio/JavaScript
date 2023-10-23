// Rat Lab Engine Version 3 - Copyright Rat Lab Studio 2024

const canvas = document.getElementById("canvas"); // Canvas where game is displayed
const ctx = canvas.getContext("2d");

function setWindowSize() { // Sets the size of the canvas to take up most of the screen
    let w = window.innerWidth,
        h = window.innerHeight;
    canvas.width = w * 0.8;
    canvas.height = h * 0.85;
}
setWindowSize();
window.addEventListener('resize', setWindowSize());

ctx.imageSmoothingEnabled = false; // Allows the game to be pixelated using nearest neighbor scaling

// Debug Variables
var debug = {
    hideObjects: false, // Hides all objects in scene
    showHitboxes: false, // Shows hitboxes behind every object
    showVectors: false
}
var debugColor = [0, 100, 100]; // Color of hitboxes
function getNewColor() {
    debugColor = [
        debugColor[0] + 5,
        debugColor[1] + 10,
        debugColor[2] + 10
    ];
    return "rgb(" + debugColor[0] + "," + debugColor[1] + "," + debugColor[2] + ")";
}

var scenes = [];
var currentScene = null;
var vectors = [];

function loadScene(scene) {
    if (scenes.indexOf(scene) == -1) {
        console.error("Error: Scene '" + sceneId + "' not found in list!");
        return;
    }
    currentScene = scene;
}

class scene { // A scene is like an isolated game of it's own
    constructor(sceneId) {
        this.id = sceneId;
        this.friction = 0.05;
        this.gravity = 0;
        this.camera = { // Changes where and how game objects are displayed, it is the "perspective" of the game
            x: 0,
            y: 0,
            offset: {
                x: 0,
                y: 0
            }
        };
        this.objs = [];
        this.backgroundObjs = [];
        this.overlayObjs = [];
        this.textObjs = [];
        scenes.push(this);
    }
}

class vector2 {
    constructor(x, y, endX, endY) {
        this.x = x;
        this.y = y;
        this.endX = endX;
        this.endY = endY;
        this.flipped = { x: false, y: false };
        vectors.push(this);
        this.fixPoints();
    }

    fixPoints() {
        if (this.x > this.endX) {
            if (this.flipped.x)
                this.flipped.x = false;
            else
                this.flipped.x = true;
        }
        if (this.y > this.endY) {
            if (this.flipped.y)
                this.flipped.y = false;
            else
                this.flipped.y = true;
        }
        this.base = this.endX - this.x;
        this.height = this.endY - this.y;
        this.length = Math.sqrt((this.base ^ 2) + (this.height ^ 2));
        this.angle = Math.sin(this.height / this.length);
    }

    setStartingPoint(x, y) {
        this.x = x;
        this.y = y;
        this.fixPoints();
    }

    setEndingPoint(endX, endY) {
        this.endX = endX;
        this.endY = endY;
        this.fixPoints();
    }

    getComponentsForTravel(speed) {
        this.fixPoints();
        let total = Math.abs(this.base) + Math.abs(this.height);
        return { x: (this.base / total) * speed, y: (this.height / total) * speed };
    }

    visualize() {
        this.fixPoints();
        ctx.fillStyle = getNewColor();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.endX, this.endY);
        ctx.closePath();
        ctx.stroke();
    }

    visualizeInScene(scene) {
        this.fixPoints();

        ctx.fillStyle = "white";
        ctx.fillRect(this.x - scene.camera.x - 2, this.y - scene.camera.y - 2, 4, 4);
        ctx.beginPath();
        ctx.strokeStyle = "lime";
        ctx.moveTo(this.x - scene.camera.x, this.y - scene.camera.y);
        ctx.lineTo(this.endX - scene.camera.x, this.endY - scene.camera.y);
        ctx.closePath();
        ctx.stroke();

        ctx.fillRect(this.x - scene.camera.x - 2, this.y - scene.camera.y + this.height - 2, 4, 4);
        ctx.beginPath();
        ctx.strokeStyle = "tomato";
        ctx.moveTo(this.x - scene.camera.x, this.y - scene.camera.y);
        ctx.lineTo(this.x - scene.camera.x, this.y - scene.camera.y + this.height);
        ctx.closePath();
        ctx.stroke();

        ctx.fillRect(this.x - scene.camera.x + this.base - 2, this.y - scene.camera.y + this.height - 2, 4, 4);
        ctx.beginPath();
        ctx.strokeStyle = "aqua";
        ctx.moveTo(this.x - scene.camera.x, this.y - scene.camera.y + this.height);
        ctx.lineTo(this.x - scene.camera.x + this.base, this.y - scene.camera.y + this.height);
        ctx.closePath();
        ctx.stroke();
    }

    destroy() {
        for (let i = 0; i < vectors.length; i++) {
            if (vectors[i] == this)
                vectors.splice(i, 1);
        }
    }
}

class obj { // General class, mainly for inheritance
    constructor(scene, x, y, w, h, mass, movable = false) {
        this.scene = scene;
        this.x = x; // Object's position on the x-axis
        this.y = y; // Object's position on the y-axis
        this.w = w; // Width of object
        this.h = h; // height of object
        this.mass = mass; // mass of object, used for physics calculations
        this.friction = this.scene.friction * (this.mass * 0.4);
        this.hitBoxOffset = 0; // Determines the size of the hitbox relative to the object's texture
        this.hitBox = { // creates a box boundary around the object
            top: this.y + this.hitBoxOffset,
            bottom: this.y + this.h - this.hitBoxOffset * 2,
            left: this.x + this.hitBoxOffset,
            right: this.x + this.w - this.hitBoxOffset * 2
        }

        this.movable = movable; // Enables or disables physics for the object

        this.forces = { // Stored forces on the object
            horizontal: 0,
            vertical: 0
        }

        this.vectors = [];
        this.index = this.scene.objs.length;
        this.hitBoxColor = getNewColor();
        this.scene.objs.push(this); // Adds this object to the list of all game objects
    }

    updateHitBox() {
        // Updates hitbox position:
        this.hitBox = {
            top: this.y + this.hitBoxOffset * 3,
            bottom: this.y + this.h - this.hitBoxOffset * 2,
            left: this.x + this.hitBoxOffset,
            right: this.x + this.w - this.hitBoxOffset * 2
        }
    }

    physicsUpdate() {
        // Gravitational Acceleration
        if (this.scene.gravity != 0) {
            if (this.colliderCheck('down') && this.forces.vertical > 0) { // Resets gravity when object touches the ground
                this.forces.vertical *= -0.2;
            }
            else if (!this.colliderCheck('down') && (this.movable) && this.forces.vertical < 10)
                this.forces.vertical += this.scene.gravity;
        }

        // Apply Horizontal Forces
        if (this.forces.horizontal > 0)
            this.move('right', this.forces.horizontal);
        else if (this.forces.horizontal < 0)
            this.move('left', this.forces.horizontal * -1);
        // Apply Vertical Forces
        if (this.forces.vertical > 0)
            this.move('down', this.forces.vertical);
        else if (this.forces.vertical < 0)
            this.move('up', this.forces.vertical * -1);
        // Apply Horizontal Friction
        if (this.forces.horizontal > 0)
            this.forces.horizontal -= this.friction;
        else if (this.forces.horizontal < 0)
            this.forces.horizontal += this.friction;
        // Apply Vertical Friction
        if (this.scene.gravity == 0) {
            if (this.forces.vertical > 0)
                this.forces.vertical -= this.friction;
            else if (this.forces.vertical < 0)
                this.forces.vertical += this.friction;
        }
        else {
            if (this.forces.vertical > 0)
                this.forces.vertical -= this.scene.friction;
            else if (this.forces.vertical < 0)
                this.forces.vertical += this.scene.friction;
        }
        // Round the forces
        this.forces.horizontal = Math.round(this.forces.horizontal * 100) / 100;
        this.forces.vertical = Math.round(this.forces.vertical * 100) / 100;
        if (Math.abs(this.forces.horizontal) < Math.abs(this.friction))
            this.forces.horizontal = 0;
        if (this.scene.gravity == 0) {
            if (Math.abs(this.forces.vertical) < Math.abs(this.friction))
                this.forces.vertical = 0;
        }
        this.updateHitBox();
    }

    update() { } // Called every frame

    draw() { } // Draws the object

    colliderCheck(dir, exclude) {
        if (exclude == null)
            exclude = [];
        for (let i = 0; i < this.scene.objs.length; i++) {
            if (this.scene.objs[i] == this) // Makes sure objects won't collide with themselves
                continue;
            else {
                let skip = false;
                for (let e = 0; e < exclude.length; e++) {
                    if (exclude[e] == this.scene.objs[i]) {
                        skip = true;
                        break;
                    }
                }
                if (skip)
                    continue;
            }
            let o = this.scene.objs[i];
            let space = 2; // Allows you to slide on surfaces
            if (dir == 'up') {
                if (this.hitBox.top <= o.hitBox.bottom && this.hitBox.bottom >= o.hitBox.top + space) {
                    if (this.hitBox.right >= o.hitBox.left + space && this.hitBox.left <= o.hitBox.right - space) {
                        //o.onCollide(this);
                        return o;
                    }
                }
            }
            else if (dir == 'down') {
                if (this.hitBox.bottom >= o.hitBox.top && this.hitBox.top <= o.hitBox.bottom - space) {
                    if (this.hitBox.right >= o.hitBox.left + space && this.hitBox.left <= o.hitBox.right - space) {
                        //o.onCollide(this);
                        return o;
                    }
                }
            }
            else if (dir == 'left') {
                if (this.hitBox.left <= o.hitBox.right && this.hitBox.right >= o.hitBox.left + space) {
                    if (this.hitBox.bottom >= o.hitBox.top + space && this.hitBox.top <= o.hitBox.bottom - space) {
                        //o.onCollide(this);
                        return o;
                    }
                }
            }
            else if (dir == 'right') {
                if (this.hitBox.right >= o.hitBox.left && this.hitBox.left <= o.hitBox.right - space) {
                    if (this.hitBox.bottom >= o.hitBox.top + space && this.hitBox.top <= o.hitBox.bottom - space) {
                        //o.onCollide(this);
                        return o;
                    }
                }
            }
            else if (dir == "all") {
                if (this.colliderCheck("up"))
                    return this.colliderCheck("up");
                else if (this.colliderCheck("down"))
                    return this.colliderCheck("down");
                else if (this.colliderCheck("left"))
                    return this.colliderCheck("left");
                else if (this.colliderCheck("right"))
                    return this.colliderCheck("right");
            }
        }
        return false;
    }

    futureColliderCheck(dir) {
        let tempObj = new box(this.scene, this.x + this.forces.horizontal * 2, this.y + this.forces.vertical * 2, this.w, this.h, this.mass, "rgba(0,0,0,1)", this.movable);
        let c = tempObj.colliderCheck(dir, [this]);
        tempObj.destroy();
        return(c);
    }

    onCollide(collidingObject) { } // Called when object is collided with

    backTrack() {
        this.x -= this.forces.horizontal;
        this.y -= this.forces.vertical;
    }

    move(dir, speed) {
        speed *= 1;
        let strength = 0.02 * this.mass; // Strength of push force
        try {
            if (dir == 'up') {
                if (!this.futureColliderCheck('up')) {
                    this.y -= speed;
                }
                else {
                    this.futureColliderCheck('up').applyForce('vertical', -strength); // Applies a pushing force to the interacting object
                    if (this.movable)
                        this.forces.vertical *= -1; // Applies a force back on the main object*/
                }
            }
            else if (dir == 'down') {
                if (!this.futureColliderCheck('down')) {
                    this.y += speed;
                }
                else {
                    this.futureColliderCheck('down').applyForce('vertical', strength);
                    if (this.movable)
                        this.forces.vertical *= -1;
                }
            }
            else if (dir == 'right') {
                if (!this.futureColliderCheck('right')) {
                    this.x += speed;
                }
                else {
                    this.futureColliderCheck('right').applyForce('horizontal', strength);
                    if (this.movable)
                        this.forces.horizontal *= -1;
                }
            }
            else if (dir == 'left') {
                if (!this.futureColliderCheck('left')) {
                    this.x -= speed;
                }
                else {
                    this.futureColliderCheck('left').applyForce('horizontal', -strength);
                    if (this.movable)
                        this.forces.horizontal *= -1;
                }
            }
        }
        catch {
            console.error("Unable to push force onto object");
        }
    }

    applyForce(axis, magnitude) { // Applies a force to the object obeying the physics this.scene's ruleset
        magnitude *= 1;
        if (!this.movable)
            return;
        if (axis == 'horizontal')
            this.forces.horizontal += magnitude;
        else if (axis == 'vertical')
            this.forces.vertical += magnitude;
        else
            console.error("Error: Unknown axis '" + axis + "'");
    }

    destroy() { // Remove this object from the scene it is in
        for (let i = 0; i < this.scene.objs.length; i++) {
            if (this.scene.objs[i] == this) {
                for (let j = 0; j < this.scene.objs[i].vectors.length; j++) {
                    this.scene.objs[i].vectors[j].destroy();
                    break;
                }
                this.scene.objs.splice(i, 1);
                break;
            }
        }
    }

    addToScene(scene) { // Add an exact copy of this object to a new scene
        if (scenes.indexOf(scene) == -1) {
            console.error("Error: Scene not found!");
            return;
        }
        this.scene = scene;
        scene.objs.push(this);
    }

    removeFromScene(scene) { // Remove exact copies of this object from a designated scene
        for (let i = 0; i < scene.objs.length; i++) {
            if (scene.objs[i] == this)
                scene.objs.splice(i, 1);
        }
    }

    moveToScene(scene) { // Relocate this object to a new scene
        let oldScene = this.scene;
        this.addToScene(scene);
        this.removeFromScene(oldScene);
    }
}

class box extends obj { // Simple box object
    constructor(scene, x, y, w, h, mass, color, movable = false) {
        super(scene, x, y, w, h, mass, movable);
        this.color = color;
        this.hitBoxOffset = 0;
        this.hitBox = {
            top: this.y + this.hitBoxOffset,
            bottom: this.y + this.h - this.hitBoxOffset * 2,
            left: this.x + this.hitBoxOffset,
            right: this.x + this.w - this.hitBoxOffset * 2
        }
    }

    draw() {
        ctx.fillStyle = this.hitBoxColor;
        if (debug.showHitboxes)
            ctx.fillRect(this.hitBox.left - this.scene.camera.x, this.hitBox.top - this.scene.camera.y, this.hitBox.right - this.hitBox.left, this.hitBox.bottom - this.hitBox.top); // Draw Hitboxes
        if (debug.hideObjects)
            return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.scene.camera.x, this.y - this.scene.camera.y, this.w, this.h);
    }

    animate() {
        this.draw();
    }
}

class texture {
    constructor(textureFilePath, resolutionX, resolutionY, frameCount) {
        this.textureFilePath = textureFilePath;
        this.resolutionX = resolutionX;
        this.resolutionY = resolutionY;
        this.texture = new Image(this.resolutionX, this.resolutionY);
        this.texture.src = this.textureFilePath;

        this.animation = { // Details about the animation state of the object
            frame: 1,
            frameCount: frameCount,
            rate: 1
        }
    }

    draw(scene, x, y, width, height) {
        let srcRect = { x: this.resolutionX * (this.animation.frame - 1), y: 0, width: this.resolutionX, height: this.resolutionY };
        let destRect = { x: x, y: y, width: width, height: height };
        ctx.drawImage(this.texture, srcRect.x, srcRect.y, srcRect.width, srcRect.height, x - scene.camera.x, y - scene.camera.y, destRect.width, destRect.height);
        if (this.animation.rate > 0) { }
        //this.advanceFrame();
        else
            this.animation.frame = 1;
    }

    advanceFrame() {
        if (this.animation.frame >= this.animation.frameCount)
            this.animation.frame = 1;
        else
            this.animation.frame++;
    }
}

class spriteObj extends obj {
    constructor(scene, x, y, w, h, mass, texture, movable = true) {
        super(scene, x, y, w, h, mass, movable);
        this.texture = texture;
        this.dir = 'right'; // Direction that the object is facing
        this.moving = false;

        this.hitBoxOffset = 0;

        this.animation = { // Details about the animation state of the object
            frame: 1,
            frameCount: this.frameCount,
            rate: 1
        }
    }

    animate() { // Draws the object and progresses the animation by 1 frame
        this.draw();
    }

    draw() {
        if (debug.showHitboxes)
            ctx.fillRect(this.hitBox.left - this.scene.camera.x, this.hitBox.top - this.scene.camera.y, this.hitBox.right - this.hitBox.left, this.hitBox.bottom - this.hitBox.top); // Draw Hitboxes
        if (debug.hideObjects)
            return;
        this.texture.draw(this.scene, this.x, this.y, this.w, this.h);
    }
}

class overlayObj {
    constructor(scene, x, y, w, h, texture) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.texture = texture;
        this.scene.overlayObjs.push(this);
    }

    animate() { // Draws the object and progresses the animation by 1 frame
        this.draw();
        if (this.texture.animation.frame >= this.texture.animation.frameCount)
            this.texture.animation.frame = 1;
        else
            this.texture.animation.frame++;
    }

    draw() {
        if (debug.hideObjects)
            return;
        let srcRect = { x: this.texture.resolutionX * (this.texture.animation.frame - 1), y: 0, width: this.texture.resolutionX, height: this.texture.resolutionY };
        let destRect = { x: this.x, y: this.y, width: this.w, height: this.h };
        ctx.drawImage(this.texture.texture, srcRect.x, srcRect.y, srcRect.width, srcRect.height, this.x, this.y, destRect.width, destRect.height);
    }
}

class backgroundTile { // Tiles that are rendered behind everything else and have no collision
    constructor(scene, x, y, w, h, texture) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.texture = texture;
        this.scene.backgroundObjs.push(this);
    }

    animate() {
        this.draw();
    }

    draw() {
        this.texture.draw(this.scene, this.x, this.y, this.w, this.h);
    }
}

class textBox {
    constructor(scene, isOverlay, x, y, w, h, text, textFont, textColor, backgroundColor, padding) {
        this.scene = scene;
        this.isOverlay = isOverlay;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.textFont = textFont;
        this.textColor = textColor;
        this.backgroundColor = backgroundColor;
        this.padding = padding;
        this.scene.textObjs.push(this);
    }

    draw() {
        if (this.isOverlay) {
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.font = this.textFont;
            ctx.fillStyle = this.textColor;
            ctx.fillText(this.text, this.x + this.padding - 5, this.y + this.h - this.padding, this.w - this.padding * 1.8);
        }
        else {
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(this.x - this.scene.camera.x, this.y - this.scene.camera.y, this.w, this.h);
            ctx.font = this.textFont;
            ctx.fillStyle = this.textColor;
            ctx.fillText(this.text, this.x + this.padding - 5 - this.scene.camera.x, this.y + this.h - this.padding - this.scene.camera.y, this.w - this.padding * 1.8);
        }
    }
}

let keys = []; // Array of all keys that have been pressed
document.addEventListener('keydown', function (e) {
    let k = e.keyCode;
    keys[k] = true; // Sets the key to active in the array
});
document.addEventListener('keyup', function (e) {
    let k = e.keyCode;
    keys[k] = false;
});
function getKey(key) { // Returns the value of a specific key from the keys array
    if (key == "Space")
        return keys[32];
    else if (key == "Backspace")
        return keys[8];
    else if (key == "Shift")
        return keys[16];
    else if (key == "Enter")
        return keys[13];
    else if (key == "ArrowUp")
        return keys[38];
    else if (key == "ArrowDown")
        return keys[40];
    else if (key == "ArrowLeft")
        return keys[37];
    else if (key == "ArrowRight")
        return keys[39];
    return keys[key.charCodeAt(0)];
}

function sortByY(objects) { // Sorts objects in order of their y position
    const sortedObjects = [...objects];
    sortedObjects.sort((a, b) => a.y - b.y);
    return sortedObjects;
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears all objects from the canvas
    for (let i = 0; i < currentScene.backgroundObjs.length; i++) // Draws all objects in the background
        currentScene.backgroundObjs[i].draw();
    let sorted = sortByY(currentScene.objs); // Allows objects to be drawn in order of their y position to create a 3d effect
    for (let i = 0; i < sorted.length; i++) // Draws all objects
        sorted[i].draw();
    for (let i = 0; i < currentScene.textObjs.length; i++) // Draws all objects
        currentScene.textObjs[i].draw();
    for (let i = 0; i < currentScene.overlayObjs.length; i++) // Draws all objects
        currentScene.overlayObjs[i].draw();
    if (debug.showVectors) {
        for (let i = 0; i < vectors.length; i++)
            vectors[i].visualizeInScene(currentScene);
    }
    drawOther();
}

function animate() { // Plays animations for all objects
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears all objects from the canvas
    for (let i = 0; i < currentScene.objs.length; i++) {
        if (currentScene.objs[i].texture != null && currentScene.objs[i].texture.animation.rate > 0)
            currentScene.objs[i].texture.advanceFrame();
    }
}

function createBoxOfTiles(scene, x, y, w, h, mass, texture) { // Creates a box of spriteObj tiles
    let xLength = Math.floor(w / texture.resolutionX);
    let yLength = Math.floor(h / texture.resolutionY);
    for (let i = 0; i < xLength; i++) {
        for (let j = 0; j < yLength; j++)
            new spriteObj(scene, i * texture.resolutionX + x, j * texture.resolutionY + y, texture.resolutionX, texture.resolutionY, mass, texture, false);
    }
}

function moveCameraToObject(object) { // Moves the camera to the designated object
    currentScene.camera.x = object.x - canvas.width / 2 + object.w / 2 + currentScene.camera.offset.x;
    currentScene.camera.y = object.y - canvas.height / 2 + object.h / 2 + currentScene.camera.offset.y;
}

function update(delta) { } // Called every frame

function drawOther() { } // Draws anything abouve everything else

let lastTime = 0;
function updateEngine(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    update(deltaTime); // Game-specific update function

    // Update animation logic here using delta time
    for (let i = 0; i < currentScene.objs.length; i++) {
        currentScene.objs[i].physicsUpdate(); // Updates all game objects in the physics world
        currentScene.objs[i].update(); // Updates all game objects
    }
    redraw(); // Draws all objects

    requestAnimationFrame(updateEngine);
}

async function start() { // Waits to start the code for 50 milliseconds
    await new Promise((resolve) => setTimeout(resolve, 50));
    requestAnimationFrame(updateEngine);
}
start();

setInterval(function () { // Animations run slower than the rest of the game, so they have their own function here
    animate();
}, 100);