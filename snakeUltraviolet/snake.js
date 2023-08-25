// Snake - Ultraviolet Edition
// Rat Lab 2023

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const output = document.getElementById("output");
output.addEventListener("DOMSubtreeModified", function () { // Scrolls log to bottom
    output.scrollTop = output.scrollHeight;
});
const colors = {
    red: 'tomato',
    green: 'lime',
    blue: 'aqua',
}
var paused = true;
var gamemodes = {
    breakout: false,
}

var objs = [];
const size = 30;
const gap = size / 5;
const gridSize = {
    width: Math.floor(canvas.width / (size + gap / 2)),
    height: Math.floor(canvas.height / (size + gap / 2))
}

ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
var grid = []; //Top left of each grid space
for (let i = 0; i < gridSize.height; i++) {
    for (let j = 0; j < gridSize.width; j++) {
        //                x        y
        grid.push([j * size + gap / 2, i * size + gap / 2]);
        ctx.fillRect((size + gap / 2) * j + gap / 2, (size + gap / 2) * i + gap / 2, size, size);
    }
}

function getRandomSpace() {
    let space = Math.floor(Math.random() * (gridSize.width - 2));
    return space;
}

function log(text) {
    output.innerHTML += "<p>" + text + "</p>";
}

class square {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.w = size;
        this.h = size;
        this.colliderActive = true;
        this.type = 'square';
        this.instantiate();
    }

    instantiate() {
        objs.push(this);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * (size + gap / 2) + gap / 2, this.y * (size + gap / 2) + gap / 2, this.w, this.h);
    }

    update() {
        // Squares do not draw themselves unless they are explicitly told to
        if (gamemodes.breakout) {
            if (this.colliderActive) {
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(this.x * (size + gap / 2) + gap / 2, this.y * (size + gap / 2) + gap / 2, this.w, this.h);
            }
        }
    }
}

class apple extends square {
    constructor(color) {
        super(getRandomSpace(), getRandomSpace(), color);
        this.type = 'apple';
    }

    update() {
        this.draw();
    }
}

class player extends square {
    constructor(x, y, color) {
        super(x, y, color);
        this.dir = 'right';
        this.speed = 1;
        this.length = 1;
        this.parts = [];
        this.type = 'player';
        this.controls = {
            up: 87,
            down: 83,
            left: 65,
            right: 68
        }
        this.turning = false; // This variable ensures you cannot turn twice within the same frame, because this would cause the player to die
        this.playerNum = players.length + 1;
    }

    draw() {
        ctx.fillStyle = this.color;
        for (let i = 0; i < this.parts.length; i++)
            this.parts[i].draw();
    }

    move() {
        this.parts.push(new square(this.x, this.y, this.color));
        if (this.dir == 'up')
            this.y -= this.speed;
        else if (this.dir == 'down')
            this.y += this.speed;
        else if (this.dir == 'left')
            this.x -= this.speed;
        else if (this.dir == 'right')
            this.x += this.speed;
        this.draw();
    }

    update() {
        this.parts = this.parts.reverse();
        for (let i = 0; i < this.parts.length; i++) {
            if (i >= this.length - 1)
                this.parts[i].colliderActive = false;
        }
        this.parts.splice(this.length - 1, 1);
        this.parts = this.parts.reverse();
        this.move();
        if (this.colliderCheck().type == 'apple') {
            this.addPoint();
        }
        else if (this.colliderCheck() != false && this.colliderCheck().colliderActive)
            this.die();
        if (!this.isInBounds())
            this.die();
        this.turning = false;
    }

    setControls(up, down, left, right) {
        this.controls.up = up.toUpperCase().charCodeAt(0);
        this.controls.down = down.toUpperCase().charCodeAt(0);
        this.controls.left = left.toUpperCase().charCodeAt(0);
        this.controls.right = right.toUpperCase().charCodeAt(0);
    }

    setControlsFromKeyCodes(up, down, left, right) {
        this.controls.up = up;
        this.controls.down = down;
        this.controls.left = left;
        this.controls.right = right;
    }

    addPoint() {
        this.length++;
        let tempText = "<span style='color: " + this.color + ";'>Player " + this.playerNum + "</span> has collected <span style='color: " + colors.red + ";'>" + (this.length - 1) + " apple";
        if (this.length - 1 > 1)
            tempText += "s";
        tempText += "</span>!";
        log(tempText);
        newApple();
    }

    colliderCheck() {
        for (let i = 0; i < objs.length; i++) {
            if (objs[i] == this)
                continue;
            if (objs[i].colliderActive && this.x == objs[i].x && this.y == objs[i].y)
                return objs[i];
        }
        return false;
    }

    isInBounds() {
        if (this.x < 0 || this.x >= gridSize.width || this.y < 0 || this.y >= gridSize.height)
            return false;
        return true;
    }

    die() {
        this.dir = 'right';
        this.length = 1;
        if (!gamemodes.breakout) {
            this.colliderActive = false; // Deleting this causes the player corpse to have collisions. Could be cool for another gamemode
            for (let i = 0; i < this.parts.length; i++)
                this.parts[i].colliderActive = false;
        }
        this.parts = [];
        this.x = 3;
        this.y = getRandomSpace();
        log("<span style='color: " + this.color + ";'>Player " + this.playerNum + "</span> died!");
    }
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < objs.length; i++)
        objs[i].update();
    // Draw Grid:
    ctx.fillStyle = "rgba(255,255,255,0.01)";
    for (let i = 0; i < gridSize.height; i++) {
        for (let j = 0; j < gridSize.width; j++)
            ctx.fillRect((size + gap / 2) * j + gap / 2, (size + gap / 2) * i + gap / 2, size, size);
    }
}

// ADDING PLAYERS:
let players = [];
function addPlayer(color, controlsArray) {
    // Player is always placed on x=2 to prevent unlucky spawns since the default movement is to the right
    players.push(new player(2, getRandomSpace(), color));
    if (controlsArray[0].length > 1)
        players[players.length - 1].setControlsFromKeyCodes(controlsArray[0], controlsArray[1], controlsArray[2], controlsArray[3]);
    else
        players[players.length - 1].setControls(controlsArray[0], controlsArray[1], controlsArray[2], controlsArray[3]);
    log("<span style='color: " + color + ";'>Player " + players.length + "</span> joined the game.");
}
let dpadBtns = document.getElementsByClassName("dpad");
for (let i = 0; i < dpadBtns.length; i++) {
    dpadBtns[i].addEventListener('click', function (event) {
        event.target.innerHTML = prompt("What key would you like to use to go " + event.target.id + "?").toUpperCase();
    });
}
function fillControls(up, down, left, right) {
    document.getElementById("up").innerHTML = up;
    document.getElementById("down").innerHTML = down;
    document.getElementById("left").innerHTML = left;
    document.getElementById("right").innerHTML = right;
}
let controlsPreset = document.getElementById("controlsPreset");
controlsPreset.addEventListener('change', function () {
    if (controlsPreset.value == "Select Preset")
        return;
    else if (controlsPreset.value == "Arrow Keys") {
        fillControls(38, 40, 37, 39);
        return;
    }
    else
        fillControls(controlsPreset.value[0], controlsPreset.value[2], controlsPreset.value[1], controlsPreset.value[3]);
});
function addNewPlayer() {
    addPlayer(document.getElementById("colorPicker").value.replace(" ", ""), [
        document.getElementById("up").innerHTML.toUpperCase(),
        document.getElementById("down").innerHTML.toUpperCase(),
        document.getElementById("left").innerHTML.toUpperCase(),
        document.getElementById("right").innerHTML.toUpperCase()
    ]);
    togglePopup("addPlayer");
}

// SPAWNING AND MANAGING APPLE:
var a = new apple(colors.red);
function newApple() {
    a.x = getRandomSpace();
    a.y = getRandomSpace();
}
newApple();

var keys = [];
document.addEventListener('keydown', function (e) {
    keys[e.keyCode] = true;
});
document.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
});
function processInput() {
    for (let i = 0; i < players.length; i++) {
        if (players[i].turning)
            continue;
        let initial = players[i].dir;
        if (keys[players[i].controls.up] == true && players[i].dir != 'down')
            players[i].dir = 'up';
        else if (keys[players[i].controls.down] == true && players[i].dir != 'up')
            players[i].dir = 'down';
        else if (keys[players[i].controls.left] == true && players[i].dir != 'right')
            players[i].dir = 'left';
        else if (keys[players[i].controls.right] == true && players[i].dir != 'left')
            players[i].dir = 'right';
        if (initial != players[i].dir)
            this.turning = true;
    }
}

setInterval(function () { // Runs every 100 milliseconds
    if (paused)
        return;
    redraw();
}, 100);

setInterval(function () { // Runs every millisecond
    if (paused)
        return;
    processInput();
}, 1);

function togglePopup(popupName) {
    let popup = document.getElementById(popupName);
    if (popup.style.display == 'none') {
        popup.style.display = 'inline';
        togglePause(true);
    }
    else
        popup.style.display = 'none';
}

const pauseButton = document.getElementById("pauseButton");
function togglePause(optionalValue) {
    if (optionalValue != null)
        paused = !optionalValue;
    if (paused) {
        pauseButton.innerHTML = "Pause";
        paused = false;
        log("<span style='color: lime;'>Game unpaused!</span>");
    }
    else {
        pauseButton.innerHTML = "Unpause";
        paused = true;
        log("<span style='color: tomato;'>Game paused!</span>")
    }
}
canvas.addEventListener("click", function () {
    togglePause();
});

function applyGamemodes() {
    if (document.getElementById("breakoutGamemode").checked) {
        gamemodes.breakout = true;
        log("Breakout gamemode enabled!");
    }
    else {
        gamemodes.breakout = false;
        log("Breakout gamemode disabled, please refresh!");
        window.location.reload();
    }
    togglePopup("gamemodes");
}