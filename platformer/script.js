// Game Setup:
world.gravity = 0.25;
canvas.style.backgroundColor = "darkslateblue";
camera.offset.y = -250;
camera.offset.x = 50;

// Variables:
var canJump = false;

// Object Instantiation:
let player = new spriteObj(500, 300, 96, 96, 10, 'assets/textures/RatRight.png', 32, 32, 4, false);
player.hitBoxOffset = 8;
let labTable = new spriteObj(700, 322, 44 * 3, 26 * 3, 30, 'assets/textures/labTable.png', 44, 26, 0, false);
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        new box(i * 50 + 350, j * 50 + 100, 40, 40, 1, 'rgba(0, ' + i * 20 + 100 + ', ' + j * 20 + 100 + ', 1)', true);
    }
}
createBoxOfTiles(0, 400, 1200, 32, 0, 'assets/textures/blueTile.png', 32, 16);

// Movement Logic:
function processMovement(delta) {
    let speed = playerSpeed;
    if ((getKey("W") || getKey("Space")) && canJump) {// W
        player.applyForce('vertical', -10);
    }
    if (getKey("A")) { // A
        player.move('left', speed * delta);
        player.dir = 'left';
        player.texture.src = "assets/textures/RatLeft.png";
    }
    if (getKey("S")) // S
        player.move('down', speed * delta);
    if (getKey("D")) { // D
        player.move('right', speed * delta);
        player.dir = 'right';
        player.texture.src = "assets/textures/RatRight.png";
    }
    moveCameraToPlayer();
}

// Update Function:
function update(delta) { // Runs every frame
    if (player.colliderCheck("down"))
        canJump = true;
    else
        canJump = false;

    processMovement(delta);
}