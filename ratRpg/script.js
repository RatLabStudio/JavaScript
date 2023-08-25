// Using Rat Lab V2 Engine

// Title Screen:
var titleScene = new scene("title");
let titleText = new textBox(titleScene, true, canvas.width / 2 - 200 + 10, canvas.height * 0.2, 400, 45, "Rat Lab RPG", "64px sans-serif", "aliceblue", "rgba(256,256,256,0)", 10);

var testScene = new scene("test");
var testScene2 = new scene("test2");

loadScene(testScene);

// Create background
for (let i = -50; i < 50; i++) {
    for (let j = -50; j < 50; j++) {
        new backgroundTile(testScene, i * 31, j * 31, 32, 32, 'assets/textures/groundTile.png', 16, 16, 0);
    }
}

let player = new spriteObj(testScene, 500, 300, 96, 96, 0, 'assets/textures/RatRight.png', 32, 32, 4, true);
player.hitBoxOffset = 10;

let b = new box(testScene, 100, 330, 40, 40, 0, "lime", true);
let b2 = new box(testScene, 100, 100, 40, 40, 0, "aqua", false);

b.applyForce("horizontal", 5);

let t = new textBox(testScene, false, -20, canvas.height * 0.7, 900, 100, "Hello, world! Welcome to the Rat Lab!", "48px sans-serif", "aliceblue", "rgba(256,256,256,0.1)", 20);
let scoreDisplay = new textBox(testScene, true, 20, 20, 150, 45, "Score: 0pts", "32px sans-serif", "aliceblue", "rgba(256,256,256,0.1)", 10);

function processMovement(delta) {
    let speed = 300; // Player speed
    player.moving = false;
    if (getKey("W") || getKey("ArrowUp")) { // W
        player.move('up', speed * delta);
        player.moving = true;
    }
    if (getKey("A") || getKey("ArrowLeft")) { // A
        player.move('left', speed * delta);
        player.dir = 'left';
        player.texture.src = "assets/textures/RatLeft.png";
        player.moving = true;
    }
    if (getKey("S") || getKey("ArrowDown")) { // S
        player.move('down', speed * delta);
        player.moving = true;
    }
    if (getKey("D") || getKey("ArrowRight")) { // D
        player.move('right', speed * delta);
        player.dir = 'right';
        player.texture.src = "assets/textures/RatRight.png";
        player.moving = true;
    }
    if (!player.moving)
        player.animation.frame = 1;
    moveCameraToObject(player);
}

// Update Function:
function update(delta) { // Runs every frame
    processMovement(delta);
}

document.addEventListener("keydown", function (e) {
    if (e.key == "q") {
        console.log("Changing Scene...")
        if (currentScene.id == "test") {
            loadScene(testScene2);
            player.moveToScene(testScene2);
        }
        else {
            loadScene(testScene);
            player.moveToScene(testScene);
        }
    }
});