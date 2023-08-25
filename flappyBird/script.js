// Using the Rat Lab Game Engine

// Difficulty:
var gap = 350;
var heightGap = 500;
var speed = 4;
var dead = false;

// Variables:
var score = 0;

world.gravity = 0.25;

function update(delta) {
    if (player.colliderCheck('right') || player.colliderCheck('up') || player.colliderCheck('down') || player.colliderCheck('left') || player.y < 0 || player.y + player.h > canvas.height)
        die();
    player.x += speed;
    updatePipes();
    //moveCameraToPlayer();
    camera.x = player.x - canvas.width / 2 + player.w;
}

function die() {
    speed = 0;
    dead = true;
}

function respawn() {
    createPipes();
    player.x = 500;
    player.y = 300;
    dead = false;
    score = 0;
    player.forces.vertical = 0;
    speed = 4;
}

function click() {
    if (dead)
        respawn();
    else if (canJump)
        player.applyForce('vertical', -11);
    canJump = false;
}

let canJump = true;
document.addEventListener('keydown', function (e) {
    let k = e.keyCode;
    keys[k] = true;
    if (k == 87 || k == 32) {
        click();
    }
});
document.addEventListener('keyup', function (e) {
    canJump = true;
    let k = e.keyCode;
    keys[k] = false;
});

// INSTANTIATION:
let player = new spriteObj(500, 300, 96, 96, 0, 'assets/textures/RatRight.png', 32, 32, 4, true);
player.hitBoxOffset = 10;

// PIPES:
var lastPipeHieght = 0;
function getRandomPipeHeight() {
    lastPipeHieght = canvas.height - Math.floor(Math.random() * 300) - 50;
    return lastPipeHieght;
}
let startingPos = canvas.width;
let amountOfPipeSets = 1;
var pipes = []
function createPipes() {
    pipes = [];
    amountOfPipeSets = 1;
    for (let i = 0; i < 10; i++) {
        pipes.push([new spriteObj(startingPos + gap * amountOfPipeSets, getRandomPipeHeight(), 64, 1024, 0, 'assets/textures/pipe.png', 32, 512, 0, false), false]);
        pipes.push([new spriteObj(startingPos + gap * amountOfPipeSets, lastPipeHieght - canvas.height - heightGap, 64, 1024, 0, 'assets/textures/pipeFlipped.png', 32, 512, 0, false), false]);
        amountOfPipeSets++;
    }
}
createPipes();
let greatestX = 0;
function updatePipes() {
    for (let i = 0; i < pipes.length; i++) {
        if (pipes[i][0].x + pipes[i][0].w / 2 < player.x && !pipes[i][1]) {
            pipes[i][1] = true;
            score += 0.5;
            document.getElementById("score").innerHTML = score + "";
        }
        else if (pipes[i][0].x > player.x)
            pipes[i][1] = false;
        if (pipes[i][0].x + pipes[i][0].w - camera.x < 0) {
            if (pipes[i][0].texturePath == 'assets/textures/pipe.png') {
                pipes[i][0].y = getRandomPipeHeight();
                for (let j = 0; j < pipes.length; j++) {
                    if (pipes[j][0].x > greatestX)
                        greatestX = pipes[j][0].x;
                }
            }
            else
                pipes[i][0].y = lastPipeHieght - canvas.height - 500;
            pipes[i][0].x = greatestX + gap;
        }
    }
}