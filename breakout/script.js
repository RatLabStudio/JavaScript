class projectile extends spriteObj {
    constructor(sender, vector, width, height, texture) {
        super(sender.scene, vector.x, vector.y, width, height, 0, texture, true);
        this.sender = sender;
        this.texture.animation.rate = 0;
        this.vector = vector;
        this.vectors.push(this.vector);
        this.friction = 0.001;
        this.displacement = {
            x: this.vector.base,
            y: this.vector.height
        }
        this.speed = 20;
        this.forces.horizontal += this.sender.forces.horizontal;
        this.forces.vertical += this.sender.forces.vertical;
        let components = vector.getComponentsForTravel(this.speed);
        this.forces.horizontal = components.x;
        this.forces.vertical = components.y;
    }

    explode() {
        this.texture.animation.rate = 1;
        this.forces.horizontal = 0;
        this.forces.vertical = 0;
    }

    update() {
        let colCheck = this.colliderCheck("all");
        // Force the projectile to explode if it is 1000 px away from it's sender
        if (Math.abs(this.x) > Math.abs(this.sender.x + 1000) || Math.abs(this.y) > Math.abs(this.sender.y + 1000)) {
            this.destroy();
            return;
        }
        if (this.texture.animation.rate > 0 && this.texture.animation.frame == this.texture.animation.frameCount)
            this.destroy();
        if (colCheck == this.sender)
            return;
        else if (colCheck) {
            this.explode();
            colCheck.destroy();
            this.hitBoxOffset = 1000; // Makes the projectile have no collisions
        }
    }
}

class enemy extends spriteObj {
    constructor(scene, x, y, w, h, mass, texture, movable = true) {
        super(scene, x, y, w, h, mass, texture, movable);
        this.speed = 4;
        this.vecToPlayer = new vector2(this.x + this.w / 2, this.y + this.h / 2, player.x + player.w / 2, player.y + player.h / 2);
        this.vectors.push(this.vecToPlayer);
    }

    update() {
        if (this.colliderCheck("all") == player) {
            player.destroy();
            let gameOver = new textBox(testScene, true, canvas.width * 0.5, canvas.height * 0.4, 300, 80, "Game Over!", "48px sans-serif", "red", "rgba(0,0,0,0.9)", 20);
            gameOver.x -= gameOver.w / 2;
        }
        this.vecToPlayer.setStartingPoint(this.x + this.w / 2, this.y + this.h / 2);
        this.vecToPlayer.setEndingPoint(player.x + player.w / 2, player.y + player.h / 2);
        let components = this.vecToPlayer.getComponentsForTravel(this.speed);
        this.move("right", components.x);
        this.move("down", components.y);
    }

    destroy() {
        score += 5;
        scoreDisplay.text = "Score: " + score + "pts";
        super.destroy();
    }
}

var testScene = new scene("test");
debug.showVectors = false;
debug.showHitboxes = false;
loadScene(testScene);

let score = 0;
let scoreDisplay = new textBox(testScene, true, 20, 20, 150, 45, "Score: 0pts", "32px sans-serif", "aliceblue", "rgba(256,256,256,0.1)", 10);

// Create background
let groundTexture = new texture('assets/sprites/groundTile.png', 16, 16, 0);
for (let i = -50; i < 50; i++) {
    for (let j = -50; j < 50; j++)
        new backgroundTile(testScene, i * 31, j * 31, 32, 32, groundTexture);
}

let player = new spriteObj(testScene, 500, 300, 96, 96, 100, new texture("assets/sprites/RatRight.png", 32, 32, 4), true);
player.hitBoxOffset = 10;

let testBox = new spriteObj(testScene, 550, 100, 32, 32, 10, new texture("assets/sprites/box.png", 16, 16, 1), true);
let testBox2 = new box(testScene, 600, 100, 32, 32, 10, "lime", true);

//new enemy(testScene, 100, 150, 96, 96, 100, new texture("assets/sprites/RatRight.png", 32, 32, 4), true);

let speed = 300; // Player speed
function processMovement(delta) {
    player.texture.animation.rate = 0;
    if (getKey("W") || getKey("ArrowUp")) { // W
        player.move('up', speed * delta);
        //player.forces.vertical = -5;
        player.texture.animation.rate = 1;
    }
    if (getKey("A") || getKey("ArrowLeft")) { // A
        player.move('left', speed * delta);
        //player.forces.horizontal = -5;
        player.dir = 'left';
        player.texture.texture.src = "assets/sprites/RatLeft.png";
        player.texture.animation.rate = 1;
    }
    if (getKey("S") || getKey("ArrowDown")) { // S
        player.move('down', speed * delta);
        //player.forces.vertical = 5;
        player.texture.animation.rate = 1;
    }
    if (getKey("D") || getKey("ArrowRight")) { // D
        player.move('right', speed * delta);
        //player.forces.horizontal = 5;
        player.dir = 'right';
        player.texture.texture.src = "assets/sprites/RatRight.png";
        player.texture.animation.rate = 1;
    }
    moveCameraToObject(player);
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return { x: x, y: y };
}

let cursor = new overlayObj(testScene, 0, 0, 10, 10, new texture("assets/sprites/crosshair.png", 8, 8, 1));
document.addEventListener("mousemove", function (event) {
    cursor.x = getMousePosition(canvas, event).x - cursor.w / 2;
    cursor.y = getMousePosition(canvas, event).y - cursor.h / 2;
});

canvas.addEventListener("click", function (event) {
    document.querySelector("html").style.cursor = "none";
    let sendLocation = { x: getMousePosition(canvas, event).x + player.scene.camera.x - cursor.w, y: getMousePosition(canvas, event).y - cursor.h + player.scene.camera.y };
    let offset = { x: -10, y: 0 };
    if (sendLocation.x > player.x + player.w / 2)
        offset.x = player.w;
    if (sendLocation.y > player.y + player.h / 2)
        offset.y = player.h;
    new projectile(player, new vector2(player.x + offset.x, player.y + offset.y, sendLocation.x, sendLocation.y), 28, 28, new texture("/assets/sprites/fireBall.png", 14, 14, 6));
});

function update(delta) { // Runs every frame
    processMovement(delta);
}

function drawOther() { }