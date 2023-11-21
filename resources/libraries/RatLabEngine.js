// Rat Lab Engine - Copyright Rat Lab 2023

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

var objs = []; // All objects in the scene are contained here
var backgroundObjs = []; // All background objects, always drawn first

const world = { // The physics world
    friction: 0.1, // Determines how fast things will lose force
    gravity: 0
}

var playerSpeed = 300;

var camera = { // Changes where and how game objects are displayed, it is the "perspective" of the game
    x: 0,
    y: 0,
    offset: {
        x: 0,
        y: 0
    }
}

// Debug Variables
var debug = {
    hideObjects: false, // Hides all objects in scene
    showHitboxes: false // Shows hitboxes behind every object
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

class obj { // General class, mainly for inheritance
    constructor(x, y, w, h, mass, movable = false) {
        this.x = x; // Object's position on the x-axis
        this.y = y; // Object's position on the y-axis
        this.w = w; // Width of object
        this.h = h; // height of object
        this.mass = mass; // mass of object, used for physics calculations

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

        this.index = objs.length;
        this.hitBoxColor = getNewColor();
        objs.push(this); // Adds this object to the list of all game objects
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
        if (this.colliderCheck('down') && this.forces.vertical > 0) { // Resets gravity when object touches the ground
            this.forces.vertical *= -0.2;
        }
        else if (!this.colliderCheck('down') && (this.movable || this.index == player.index) && this.forces.vertical < 10)
            this.forces.vertical += world.gravity;

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
            this.forces.horizontal -= world.friction;
        else if (this.forces.horizontal < 0)
            this.forces.horizontal += world.friction;
        // Apply Vertical Friction
        if (this.forces.vertical > 0)
            this.forces.vertical -= world.friction;
        else if (this.forces.vertical < 0)
            this.forces.vertical += world.friction;
        // Round the forces
        this.forces.horizontal = Math.round(this.forces.horizontal * 100) / 100
        this.forces.vertical = Math.round(this.forces.vertical * 100) / 100
        this.updateHitBox();
    }

    update() { } // Called every frame

    draw() { } // Draws the object

    colliderCheck(dir) {
        for (let i = 0; i < objs.length; i++) {
            if (i == this.index) // Makes sure objects won't collide with themselves
                continue;
            let o = objs[i];
            let space = 7; // Allows you to slide on surfaces
            if (dir == 'up') {
                if (this.hitBox.top <= o.hitBox.bottom && this.hitBox.bottom >= o.hitBox.top + space) {
                    if (this.hitBox.right >= o.hitBox.left + space && this.hitBox.left <= o.hitBox.right - space)
                        return o.index;
                }
            }
            else if (dir == 'down') {
                if (this.hitBox.bottom >= o.hitBox.top && this.hitBox.top <= o.hitBox.bottom - space) {
                    if (this.hitBox.right >= o.hitBox.left + space && this.hitBox.left <= o.hitBox.right - space)
                        return o.index;
                }
            }
            else if (dir == 'left') {
                if (this.hitBox.left <= o.hitBox.right && this.hitBox.right >= o.hitBox.left + space) {
                    if (this.hitBox.bottom >= o.hitBox.top + space && this.hitBox.top <= o.hitBox.bottom - space)
                        return o.index;
                }
            }
            else if (dir == 'right') {
                if (this.hitBox.right >= o.hitBox.left && this.hitBox.left <= o.hitBox.right - space) {
                    if (this.hitBox.bottom >= o.hitBox.top + space && this.hitBox.top <= o.hitBox.bottom - space)
                        return o.index;
                }
            }
        }
        return false;
    }

    move(dir, speed) {
        speed *= 1;
        let strength = 0.2; // Strength of push force
        if (dir == 'up') {
            if (!this.colliderCheck('up')) {
                this.y -= speed;
            }
            else {
                objs[this.colliderCheck('up')].applyForce('vertical', -strength); // Applies a pushing force to the interacting object
                if (this.movable)
                    this.applyForce('vertical', strength * 0.8); // Applies a force back on the main object
            }
        }
        else if (dir == 'down') {
            if (!this.colliderCheck('down')) {
                this.y += speed;
            }
            else {
                objs[this.colliderCheck('down')].applyForce('vertical', strength);
                if (this.movable)
                    this.applyForce('vertical', -strength * 0.8);
            }
        }
        else if (dir == 'right') {
            if (!this.colliderCheck('right')) {
                this.x += speed;
            }
            else {
                objs[this.colliderCheck('right')].applyForce('horizontal', strength);
                if (this.movable)
                    this.applyForce('horizontal', -strength * 0.8);
            }
        }
        else if (dir == 'left') {
            if (!this.colliderCheck('left')) {
                this.x -= speed;
            }
            else {
                objs[this.colliderCheck('left')].applyForce('horizontal', -strength);
                if (this.movable)
                    this.applyForce('horizontal', strength * 0.8);
            }
        }
    }

    applyForce(axis, magnitude) { // Applies a force to the object obeying the physics world's ruleset
        magnitude *= 1;
        if (!this.movable && this.index != player.index)
            return;
        if (axis == 'horizontal')
            this.forces.horizontal += magnitude;
        else if (axis == 'vertical')
            this.forces.vertical += magnitude;
        else
            console.error("Error: Unknown axis '" + axis + "'");
    }
}

class box extends obj { // Simple box object
    constructor(x, y, w, h, mass, color, movable = false) {
        super(x, y, w, h, mass, movable);
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
            ctx.fillRect(this.hitBox.left - camera.x, this.hitBox.top - camera.y, this.hitBox.right - this.hitBox.left, this.hitBox.bottom - this.hitBox.top); // Draw Hitboxes
        if (debug.hideObjects)
            return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.w, this.h);
    }

    animate() {
        this.draw();
    }
}

class backgroundTile { // Tiles that are rendered behind everything else and have no collision
    constructor(x, y, w, h, texturePath, resolutionX, resolutionY, frameCount) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.texturePath = texturePath;
        this.texture = new Image(this.resolutionX, this.resolutionY);
        this.texture.src = this.texturePath;
        this.resolutionX = resolutionX;
        this.resolutionY = resolutionY;
        this.frameCount = frameCount;
        this.animation = {
            frame: 1,
            frameCount: this.frameCount,
            rate: 1
        }
        backgroundObjs.push(this);
    }

    animate() {
        this.draw();
        if (this.animation.frame >= this.animation.frameCount)
            this.animation.frame = 1;
        else
            this.animation.frame++;
    }

    draw() {
        let srcRect = { x: this.resolutionX * (this.animation.frame - 1), y: 0, width: this.resolutionX, height: this.resolutionY };
        let destRect = { x: this.x, y: this.y, width: this.w, height: this.h };
        ctx.drawImage(this.texture, srcRect.x, srcRect.y, srcRect.width, srcRect.height, this.x - camera.x, this.y - camera.y, destRect.width, destRect.height);
    }
}

class spriteObj extends obj {
    constructor(x, y, w, h, mass, texturePath, resolutionX, resolutionY, frameCount, movable = true) {
        super(x, y, w, h, mass, movable);
        this.texturePath = texturePath; // Location of texture
        this.resolutionX = resolutionX; // Width in pixels of the texture
        this.resolutionY = resolutionY; // Height in pixels of the texture
        this.texture = new Image(this.resolutionX, this.resolutionY);
        this.texture.src = this.texturePath;
        this.frameCount = frameCount; // Amount of frames in the animation
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
        if (this.animation.frame >= this.animation.frameCount)
            this.animation.frame = 1;
        else
            this.animation.frame++;
    }

    draw() {
        if (debug.showHitboxes)
            ctx.fillRect(this.hitBox.left - camera.x, this.hitBox.top - camera.y, this.hitBox.right - this.hitBox.left, this.hitBox.bottom - this.hitBox.top); // Draw Hitboxes
        if (debug.hideObjects)
            return;
        let srcRect = { x: this.resolutionX * (this.animation.frame - 1), y: 0, width: this.resolutionX, height: this.resolutionY };
        let destRect = { x: this.x, y: this.y, width: this.w, height: this.h };
        ctx.drawImage(this.texture, srcRect.x, srcRect.y, srcRect.width, srcRect.height, this.x - camera.x, this.y - camera.y, destRect.width, destRect.height);
    }
}

class npc extends spriteObj { // Simple textured object that walks back and fourth
    constructor(x, y, w, h, mass, texturePathRight, texturePathLeft, resolutionX, resolutionY, frameCount) {
        super(x, y, w, h, mass, texturePathRight, resolutionX, resolutionY, frameCount, false);
        this.texturePathLeft = texturePathLeft;
        this.texturePathRight = texturePathRight;
        this.speed = 4;
        this.dir = 'right';
    }

    changeDirection() {
        if (this.dir == 'left') {
            this.dir = 'right';
            this.texture.src = this.texturePathRight;
            this.move(this.dir, this.speed * 2);
        }
        else {
            this.dir = 'left';
            this.texture.src = this.texturePathLeft;
            this.move(this.dir, this.speed * 2);
        }
    }

    update() {
        // Updates hitbox position:
        this.hitBox = {
            top: this.y + this.hitBoxOffset * 3,
            bottom: this.y + this.h - this.hitBoxOffset * 2,
            left: this.x + this.hitBoxOffset,
            right: this.x + this.w - this.hitBoxOffset * 2
        }
        if (this.colliderCheck('left') !== false || this.colliderCheck('right') !== false) {
            this.changeDirection();
        }
        this.move(this.dir, this.speed);
    }
}

let keys = []; // Array of all keys that have been pressed
document.addEventListener('keydown', function (e) {
    let k = e.keyCode;
    keys[k] = true; // Sets the key to active in the array
    if (keys[87] || keys[65] || keys[83] || keys[68]) // WASD Causes the player to move
        player.moving = true;
});
document.addEventListener('keyup', function (e) {
    let k = e.keyCode;
    keys[k] = false;
    player.moving = false; // Sets the key to inactive in the array
    if (keys[87] || keys[65] || keys[83] || keys[68]) // WASD Causes the player to move
        player.moving = true;
    else { // Resets player's animation
        player.moving = false;
        player.animation.frame = 1;
    }
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
    return keys[key.charCodeAt(0)];
}

function sortByY(objects) { // Sorts objects in order of their y position
    const sortedObjects = [...objects];
    sortedObjects.sort((a, b) => a.y - b.y);
    return sortedObjects;
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears all objects from the canvas
    for (let i = 0; i < backgroundObjs.length; i++) // Draws all objects in the background
        backgroundObjs[i].draw();
    let sorted = sortByY(objs); // Allows objects to be drawn in order of their y position to create a 3d effect
    for (let i = 0; i < sorted.length; i++) // Draws all objects
        sorted[i].draw();
}

function animate() { // Plays animations for all objects
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears all objects from the canvas
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].index == player.index && !player.moving)
            continue;
        objs[i].animate();
    }
}

function createBoxOfTiles(x, y, w, h, mass, tilePath, tileSize, tileResolution) { // Creates a box of spriteObj tiles
    let xLength = Math.floor(w / tileSize);
    let yLength = Math.floor(h / tileSize);
    for (let i = 0; i < xLength; i++) {
        for (let j = 0; j < yLength; j++)
            new spriteObj(i * tileSize + x, j * tileSize + y, tileSize, tileSize, mass, tilePath, tileResolution, tileResolution, 0, false);
    }
}

function moveCameraToPlayer() { // Moves the camera to the player
    camera.x = player.x - canvas.width / 2 + player.w / 2 + camera.offset.x;
    camera.y = player.y - canvas.height / 2 + player.h / 2 + camera.offset.y;
}

function update(delta) { }

let lastTime = 0;
function updateEngine(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    update(deltaTime); // Game-specific update function

    // Update animation logic here using delta time
    for (let i = 0; i < objs.length; i++) {
        objs[i].update(); // Updates all game objects
        objs[i].physicsUpdate(); // Updates all game objects in the physics world
    }
    redraw(); // Draws all objects

    requestAnimationFrame(updateEngine);
}
requestAnimationFrame(updateEngine);

setInterval(function () { // Animations run slower than the rest of the game, so they have their own function here
    animate();
}, 100);