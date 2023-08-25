var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var unitSize = 22;
var interval = 75;
const colors = {
    red: 'tomato',
    green: 'lightgreen',
}
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
if (isMobile()) {
    var scaleFactor = 2;
    let cW = canvas.width / scaleFactor;
    while (cW % 22 != 0)
        cW--;
    cW += 2;
    canvas.width = cW;
    canvas.height = cW;
    unitSize = Math.floor(unitSize / (scaleFactor / 1.5));
    interval = 125;
}
var gridSize = (canvas.width / unitSize) - 1;

let scoreCounter = document.getElementById('scoreCounter');
if (localStorage.getItem('snakeHighScore') == null)
    localStorage.setItem('snakeHighScore', 0);
let snakeHighScore = localStorage.getItem('snakeHighScore');
document.getElementById('highScore').innerHTML = 'High Score: ' + snakeHighScore;
var score = -2;

var modes = {
    boundless: false
}
function modeSelect(mode) {
    if (mode == 'boundless') {
        let btn = document.getElementById('boundless');
        if (!modes.boundless) {
            modes.boundless = true;
            btn.style.backgroundColor = 'darkseagreen';
        }
        else {
            modes.boundless = false;
            btn.style.backgroundColor = 'seagreen';
        }
    }
}
function resetHighScore() {
    localStorage.setItem('snakeHighScore', 0);
    document.getElementById('highScore').innerHTML = 'High Score: ' + localStorage.getItem('snakeHighScore');
}

class square { //Used for the snake trail and is the parent class of player/apple
    constructor(x, y) {
        this.x = x + 2;
        this.y = y + 2;
        this.w = unitSize - 2;
        this.h = unitSize - 2;
        this.color = 'lime';
        this.draw();
    }
    draw() {
        ctx.fillRect(this.x, this.y, unitSize - 2, unitSize - 2);
    }
}
class player extends square { //Player object
    constructor(x, y) {
        super(x, y);
        this.dir = 'right'
        this.speed = unitSize;
    }
    move() {
        if (this.dir == 'up') {
            objs.push(new square(this.x - 2, this.y - 2));
            this.y -= this.speed;
        }
        else if (this.dir == 'down') {
            objs.push(new square(this.x - 2, this.y - 2));
            this.y += this.speed;
        }
        else if (this.dir == 'left') {
            objs.push(new square(this.x - 2, this.y - 2));
            this.x -= this.speed;
        }
        else if (this.dir == 'right') {
            objs.push(new square(this.x - 2, this.y - 2));
            this.x += this.speed;
        }
        this.draw();
    }
    colliderCheck() {
        for (var i = 0; i < objs.length; i++) {
            if (i == p)
                continue;
            if (objs[p].x == objs[i].x && objs[p].y == objs[i].y) //If two objects are in the same place
                return i; //Return the object index
        }
        return false;
    }
    isInBounds() {
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height)
            return false;
        return true;
    }
}
class apple extends square { //Apple to gain score
    constructor(x, y, color) {
        super(x, y);
        this.color = color;
    }
}

var keys = {
    up: false,
    down: false,
    left: false,
    right: false
}
document.addEventListener('keydown', function (e) {
    k = e.key;
    if (k == 'w')
        keys.up = true;
    else if (k == 'a')
        keys.left = true;
    else if (k == 's')
        keys.down = true;
    else if (k == 'd')
        keys.right = true;
})
document.addEventListener('keyup', function (e) {
    k = e.key;
    if (k == 'w')
        keys.up = false;
    else if (k == 'a')
        keys.left = false;
    else if (k == 's')
        keys.down = false;
    else if (k == 'd')
        keys.right = false;
})

var paused = false;
canvas.addEventListener('mousedown', function () {
    if (!paused) {
        objs[p].speed = 0;
        paused = true;
    }
    else {
        objs[p].speed = unitSize;
        paused = false;
    }
})

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let g = 255, b = 0;
    for (var i = objs.length - 1; i >= 0; i--) {
        ctx.fillStyle = objs[i].color;

        //This addes a green to blue gradient on the snake trail
        if (i > 1)
            ctx.fillStyle = 'rgb(' + '0' + ', ' + g + ', ' + b + ')';
        if (g > 50)
            g -= 2;
        b += 4;

        objs[i].draw();
    }
}

var objs = [];
var p = 0;
objs[p] = new player(unitSize, unitSize);
var a = 1;
newApple();

function randomPos() { //Returns a random usable position in the grid
    return (Math.floor(Math.random() * gridSize) * unitSize);
    //return (Math.floor(1 * gridSize) * unitSize);
}

function addPoint() {
    score += 2;
    scoreCounter.innerHTML = 'Score: ' + score;
}
function reset() {
    objs = [];
    objs[p] = new player(unitSize, unitSize);
    if (score > localStorage.getItem('snakeHighScore')) {
        localStorage.setItem('snakeHighScore', score);
        document.getElementById('highScore').innerHTML = 'High Score: ' + score;
    }
    score = -2;
    newApple();
}
function newApple() {
    addPoint();
    if ((score + 2) % 10 == 0 && score != 0)
        objs[a] = new apple(randomPos(), randomPos(), 'gold');
    else
        objs[a] = new apple(randomPos(), randomPos(), colors.red);
}

setInterval(function () { //Runs repeatedly
    if (keys.up && objs[p].dir != 'down')
        objs[p].dir = 'up';
    if (keys.left && objs[p].dir != 'right')
        objs[p].dir = 'left';
    if (keys.down && objs[p].dir != 'up')
        objs[p].dir = 'down';
    if (keys.right && objs[p].dir != 'left')
        objs[p].dir = 'right';
    objs[p].move(); //Moves in whatever direction player is facing
    let end = objs.length - score - 1; //Determines where the end of the trail is
    objs.splice(2, end); //Removes all squares past the trail end
    if ((objs[p].colliderCheck() && objs[p].colliderCheck() != a) || (!objs[p].isInBounds() && !modes.boundless))
        reset() //Player dies if they hit themselves or leave the canvas
    else if (objs[p].colliderCheck() == a)
        newApple(); //Points are gained for collecting apples
    else if (modes.boundless) {
        if (objs[p].x < 0)
            objs[p].x = canvas.width - objs[p].w;
        else if (objs[p].x > canvas.width)
            objs[p].x = 2;
        else if (objs[p].y < 0)
            objs[p].y = canvas.height - objs[p].h;
        else if (objs[p].y > canvas.height)
            objs[p].y = 2;
    }
    keyPressed = false;
    redraw();
}, interval);

// D-Pad
function up() {
    if (objs[p].dir != 'down')
        objs[p].dir = 'up';
}
function down() {
    if (objs[p].dir != 'up')
        objs[p].dir = 'down';
}
function left() {
    if (objs[p].dir != 'right')
        objs[p].dir = 'left';
}
function right() {
    if (objs[p].dir != 'left')
        objs[p].dir = 'right';
}