const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function setWindowSize() {
    let w = window.innerWidth,
        h = window.innerHeight;
    canvas.width = w * 0.8;
    canvas.height = h * 0.8;
}
setWindowSize();
window.addEventListener('resize', setWindowSize());

ctx.imageSmoothingEnabled = false;

let friction = 0.01; // Determines how fast things will lose force

var camera = {
    x: 0,
    y: 0
}

var objs = []; // All objects in the scene are contained here

class obj { // General class, mainly for inheritance
    constructor(x, y, w, h, movable = false) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

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
            this.forces.horizontal -= friction;
        else if (this.forces.horizontal < 0)
            this.forces.horizontal += friction;
        // Apply Vertical Friction
        if (this.forces.vertical > 0)
            this.forces.vertical -= friction;
        else if (this.forces.vertical < 0)
            this.forces.vertical += friction;
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
    constructor(x, y, w, h, color, movable = false) {
        super(x, y, w, h, movable);
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
class spriteObj extends obj {
    constructor(x, y, w, h, texturePath, resolutionX, resolutionY, frameCount, movable = false) {
        super(x, y, w, h, movable);
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
class playerObj extends spriteObj {
    constructor(x, y, w, h, texturePath, resolutionX, resolutionY, frameCount) {
        super(x, y, w, h, texturePath, resolutionX, resolutionY, frameCount, false);
        this.moveDir = "none";
    }

    update() {
        if (this.moveDir != "none")
            this.move(this.moveDir, 5);
        this.hitBox = {
            top: this.y + this.hitBoxOffset * 3,
            bottom: this.y + this.h - this.hitBoxOffset * 2,
            left: this.x + this.hitBoxOffset,
            right: this.x + this.w - this.hitBoxOffset * 2
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
    if (keys[87]) // W
        player.moveDir = 'up';
    if (keys[65]) { // A
        player.moveDir = 'left';
        player.dir = 'left';
        player.texture.src = "assets/textures/RatLeft.png";
    }
    if (keys[83]) // S
        player.moveDir = 'down';
    if (keys[68]) { // D
        player.moveDir = 'right';
        player.dir = 'right';
        player.texture.src = "assets/textures/RatRight.png";
    }
}

function sortByY(objects) { // Sorts objects in order of their y position
    const sortedObjects = [...objects];
    sortedObjects.sort((a, b) => a.y - b.y);
    return sortedObjects;
}
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let sorted = sortByY(objs); // Allows objects to be drawn in order of their y position to create a 3d effect
    for (let i = 0; i < sorted.length; i++)
        sorted[i].draw();
}
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < objs.length; i++) {
        /*if (objs[i].index == player.index && !player.moving)
            continue;*/
        objs[i].animate();
    }
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

let player = new playerObj(500, 300, 80, 80, 'assets/textures/RatRight.png', 32, 32, 4);
player.hitBoxOffset = 10;
var playerSpeed = 300;

let borders = {
    top: new box(0, 0, canvas.width, 10, 'aliceblue', false),
    bottom: new box(0, canvas.height - 10, canvas.width, 10, 'aliceblue', false),
    left: new box(0, 0, 10, canvas.height, 'aliceblue', false),
    right: new box(canvas.width - 10, 0, 10, canvas.height, 'aliceblue', false),
}
let grid = {
    height: 50,
    width: 50,
    size: 10,
    gap: 0
}
function random(maximum) {
    return Math.floor(Math.random() * maximum);
}

let posData = [
    "00001000000000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001111100000000000000000000000000000000000000000",
    "00000000100000000000000000000000000000000000000000",
    "00000000100000000000000000000000000000000000000000",
    "00000000100000000000000000000000000000000000000000",
    "00001000110000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001111110000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00001000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000",
];

for (let i = 0; i < posData.length; i++) {
    for (let j = 0; j < posData[i].length; j++) {
        if (posData[i][j] == "1") {
            new box(j * 20 - 10, i * 20 - 10, 20, 20, 'aliceblue', false);
        }
    }
}