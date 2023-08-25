// Rat Lab Rewritten - Copyright Rat Lab 2023
// First Version of the Rat Lab Engine

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function setWindowSize() {
    let w = window.innerWidth,
        h = window.innerHeight;
    canvas.width = w * 0.8;
    canvas.height = h * 0.85;
}
setWindowSize();

window.addEventListener('resize', setWindowSize());

ctx.imageSmoothingEnabled = false;

var objs = []; // All objects in the scene are contained here
var backgroundObjs = []; // All background objects, always drawn first

const world = {
    friction: 0.01, // Determines how fast things will lose force
    gravity: 0
}

var playerSpeed = 300;

var camera = {
    x: 0,
    y: 0
}

class obj { // General class, mainly for inheritance
    constructor(x, y, w, h, mass, movable = false) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.mass = mass;

        this.hitBoxOffset = 0;
        this.hitBox = {
            top: this.y + this.hitBoxOffset,
            bottom: this.y + this.h - this.hitBoxOffset * 2,
            left: this.x + this.hitBoxOffset,
            right: this.x + this.w - this.hitBoxOffset * 2
        }

        this.movable = movable;

        this.forces = {
            horizontal: 0,
            vertical: 0
        }

        this.index = objs.length;
        objs.push(this);
    }

    physicsUpdate() {
        // Gravitational Acceleration
        if (this.colliderCheck('down') && this.forces.vertical > 0)
            this.forces.vertical = 0;
        else if (!this.colliderCheck('down') && this.movable)
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
    }

    update() {
        // Updates hitbox position:
        this.hitBox = {
            top: this.y + this.hitBoxOffset * 3,
            bottom: this.y + this.h - this.hitBoxOffset * 2,
            left: this.x + this.hitBoxOffset,
            right: this.x + this.w - this.hitBoxOffset * 2
        }
    }

    draw() { }

    colliderCheck(dir) {
        for (let i = 0; i < objs.length; i++) {
            if (i == this.index) // Makes sure objects won't collide with themselves
                continue;
            let o = objs[i];
            let space = 5; // Allows you to slide on surfaces
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
        let strength = 0.05; // Strength of push force
        if (dir == 'up') {
            if (!this.colliderCheck('up')) {
                this.y -= speed;
            }
            else {
                objs[this.colliderCheck('up')].applyForce('vertical', -strength); // Applies a pushing force to the interacting object
                this.applyForce('vertical', strength * 0.8); // Applies a force back on the main object
            }
        }
        else if (dir == 'down') {
            if (!this.colliderCheck('down')) {
                this.y += speed;
            }
            else {
                objs[this.colliderCheck('down')].applyForce('vertical', strength);
                this.applyForce('vertical', -strength * 0.8);
            }
        }
        else if (dir == 'right') {
            if (!this.colliderCheck('right')) {
                this.x += speed;
            }
            else {
                objs[this.colliderCheck('right')].applyForce('horizontal', strength);
                this.applyForce('horizontal', -strength * 0.8);
            }
        }
        else if (dir == 'left') {
            if (!this.colliderCheck('left')) {
                this.x -= speed;
            }
            else {
                objs[this.colliderCheck('left')].applyForce('horizontal', -strength);
                this.applyForce('horizontal', strength * 0.8);
            }
        }
    }

    applyForce(axis, magnitude) {
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
}

class box extends obj {
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
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.w, this.h);
    }

    animate() {
        this.draw();
    }
}

class backgroundTile {
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
        this.texturePath = texturePath;
        this.resolutionX = resolutionX;
        this.resolutionY = resolutionY;
        this.texture = new Image(this.resolutionX, this.resolutionY);
        this.texture.src = this.texturePath;
        this.frameCount = frameCount;
        this.dir = 'right';
        this.moving = false;

        this.hitBoxOffset = 0;

        this.animation = {
            frame: 1,
            frameCount: this.frameCount,
            rate: 1
        }
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

class npc extends spriteObj {
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

function sortByY(objects) { // Sorts objects in order of their y position
    const sortedObjects = [...objects];
    sortedObjects.sort((a, b) => a.y - b.y);
    return sortedObjects;
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < backgroundObjs.length; i++) // Draws all objects in the background
        backgroundObjs[i].draw();
    let sorted = sortByY(objs); // Allows objects to be drawn in order of their y position to create a 3d effect
    for (let i = 0; i < sorted.length; i++) // Draws all objects
        sorted[i].draw();
}

function animate() { // Plays animations for all objects
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].index == player.index && !player.moving)
            continue;
        objs[i].animate();
    }
}

function createBoxOfTiles(x, y, w, h, mass, tilePath, tileSize, tileResolution) {
    let xLength = Math.floor(w / tileSize);
    let yLength = Math.floor(h / tileSize);
    for (let i = 0; i < xLength; i++) {
        for (let j = 0; j < yLength; j++) {
            new spriteObj(i * tileSize + x, j * tileSize + y, tileSize, tileSize, mass, tilePath, tileResolution, tileResolution, 0, false);
        }
    }
}

let keys = [];
document.addEventListener('keydown', function (e) {
    let k = e.keyCode;
    keys[k] = true;
    if (keys[87] || keys[65] || keys[83] || keys[68])
        player.moving = true;
});
document.addEventListener('keyup', function (e) {
    let k = e.keyCode;
    keys[k] = false;
    player.moving = false;
    if (keys[87] || keys[65] || keys[83] || keys[68])
        player.moving = true;
    else {
        player.moving = false;
        player.animation.frame = 1;
    }
});
function processMovement(delta) {
    let speed = playerSpeed;
    if (keys[87]) // W
        player.move('up', speed * delta);
    if (keys[65]) { // A
        player.move('left', speed * delta);
        player.dir = 'left';
        player.texture.src = "assets/textures/RatLeft.png";
    }
    if (keys[83]) // S
        player.move('down', speed * delta);
    if (keys[68]) { // D
        player.move('right', speed * delta);
        player.dir = 'right';
        player.texture.src = "assets/textures/RatRight.png";
    }
    camera.x = player.x - canvas.width / 2 + player.w / 2;
    camera.y = player.y - canvas.height / 2 + player.h / 2;
}

let lastTime = 0;
function update(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update animation logic here using delta time
    for (let i = 0; i < objs.length; i++) {
        objs[i].update();
        objs[i].physicsUpdate();
    }
    processMovement(deltaTime);
    redraw();

    requestAnimationFrame(update);
}
requestAnimationFrame(update);

setInterval(function () {
    animate();
}, 100);

// INSTANTIATION:

let player = new spriteObj(500, 300, 96, 96, 10, 'assets/textures/RatRight.png', 32, 32, 4, false);
player.hitBoxOffset = 10;

let npcTest = new npc(500, 400, 96, 96, 10, 'assets/textures/RatNpcRight.png', 'assets/textures/RatNpcLeft.png', 32, 32, 4);
npcTest.hitBoxOffset = 10;

let labTable = new spriteObj(200, 600, 44 * 3, 26 * 3, 30, 'assets/textures/labTable.png', 44, 26, 0, true);
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        new box(i * 50 + 300, j * 50 + 300, 40, 40, 1, 'rgba(0, ' + i * 20 + 100 + ', ' + j * 20 + 100 + ', 1)', true);
    }
}

for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
        new backgroundTile(i * 32 - 500, j * 32 - 500, 32, 32, 'assets/textures/groundTile.png', 16, 16, 0);
    }
}

createBoxOfTiles(0, 0, 1200, 32, 0, 'assets/textures/blueTile.png', 32, 16);
createBoxOfTiles(0, 0, 32, 1200, 0, 'assets/textures/blueTile.png', 32, 16);
createBoxOfTiles(0, 1200 - 32, 1200, 32, 0, 'assets/textures/blueTile.png', 32, 16);
createBoxOfTiles(1200 - 48, 0, 32, 1200, 0, 'assets/textures/blueTile.png', 32, 16);