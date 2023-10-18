var game = new scene("game");
debug.showVectors = true;
debug.showHitboxes = true;
debug.hideObjects = false;
loadScene(game);

class ball extends spriteObj {
    constructor(scene, x, y, w, h, mass, texture, movable = true) {
        super(scene, x, y, w, h, mass, texture, movable = true);
        this.damage = 1;
    }
}

let wallInfo = {
    margin: {
        top: 40, bottom: 10, left: 350, right: 600
    },
    width: 12,
    color: "white"
}
let walls = [
    new box(game, wallInfo.margin.left, wallInfo.margin.top, canvas.width - wallInfo.margin.right - wallInfo.margin.left, wallInfo.width, 0, wallInfo.color, false),
    new box(game, wallInfo.margin.left, wallInfo.margin.top, wallInfo.width, canvas.height - wallInfo.margin.bottom - wallInfo.margin.top, 0, wallInfo.color, false),
    new box(game, canvas.width - wallInfo.margin.right - wallInfo.width, wallInfo.margin.top, wallInfo.width, canvas.height - wallInfo.margin.bottom - wallInfo.margin.top, 0, wallInfo.color, false),
    new box(game, wallInfo.margin.left, canvas.height - wallInfo.margin.bottom - wallInfo.width, canvas.width - wallInfo.margin.right - wallInfo.margin.left, wallInfo.width, 0, wallInfo.color, false)
];

class tile extends box {
    constructor(scene, x, y, color) {
        super(scene, x, y, 50, 20, 0, color, false);
        /*this.health = 1;
        let len = (this.health + "").length;
        if (len <= 1)
            len = 2;
        this.text = new textBox(this.scene, false, this.x + this.w / len, this.y - 3, this.w, this.h, this.health, "16px sans-serif", "black", "rgba(0,0,0,0)", 1);*/
    }

    /*onCollide(ball) {
        console.log("g")
        this.health = this.health * 1 - ball.damage;
    }*/
}

let testBall = new ball(game, Math.round(canvas.width / 3), Math.round(canvas.height / 2), 14, 14, 0, new texture("assets/sprites/fireBall old.png", 14, 14, 1), true);
testBall.applyForce("horizontal", 5);

let otherRect = new box(game, 400, canvas.height / 2, 30, 30, 0, "red", false);

//let testTile = new tile(game, Math.round(canvas.width / 2), Math.round(canvas.height / 2), "aqua");

function update(delta) { // Runs every frame

}

function drawOther() { }