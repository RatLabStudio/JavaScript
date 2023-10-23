const canvas = document.getElementById("canvas"); // Canvas where game is displayed
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false; // Allows the game to be pixelated using nearest neighbor scaling

let objs = [];

class obj {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.forces = {
            horizontal: 0,
            vertical: 0
        };

        this.hitbox = {};
        this.updateHitbox();

        objs.push(this);
    }

    updateHitbox() {
        this.hitbox = {
            top: this.y,
            bottom: this.y + this.h,
            left: this.x,
            right: this.x + this.w
        };
    }

    physicsUpdate() {
        this.updateHitbox();
        this.move("right", this.forces.horizontal);
        this.move("up", this.forces.vertical);
    }

    update() {
        this.physicsUpdate();
    }

    draw() { }

    colliderCheck(dir, exclude) {
        if (exclude == null)
            exclude = [];
        exclude.push(this);

        for (let i in objs) {
            let skip = false;
            for (let e in exclude) {
                if (objs[i] == exclude[e]) {
                    skip = true;
                    break;
                }
            }
            if (skip)
                continue;

            let o = objs[i];

            if (dir == "up") {
                if (this.hitbox.top < o.hitbox.bottom && this.hitbox.bottom > o.hitbox.top) {
                    if (this.hitbox.right > o.hitbox.left && this.hitbox.left < o.hitbox.right) {
                        return o;
                    }
                }
            }
            else if (dir == "down") {
                if (this.hitbox.bottom > o.hitbox.top && this.hitbox.top < o.hitbox.bottom) {
                    if (this.hitbox.right > o.hitbox.left && this.hitbox.left < o.hitbox.right) {
                        return o;
                    }
                }
            }
            else if (dir == "left") {
                if (this.hitbox.left < o.hitbox.right && this.hitbox.right > o.hitbox.left) {
                    if (this.hitbox.top < o.hitbox.bottom && this.hitbox.bottom > o.hitbox.top) {
                        return o;
                    }
                }
            }
            else if (dir == "right") {
                if (this.hitbox.right > o.hitbox.left && this.hitbox.left < o.hitbox.right) {
                    if (this.hitbox.top < o.hitbox.bottom && this.hitbox.bottom > o.hitbox.top) {
                        return o;
                    }
                }
            }
            else {
                let checks = [
                    this.colliderCheck("top", exclude),
                    this.colliderCheck("bottom", exclude),
                    this.colliderCheck("left", exclude),
                    this.colliderCheck("right", exclude),
                ];
                for (c in checks) {
                    if (checks[c] != null && checks[c] != false)
                        return checks[c];
                }
            }
        }
        return false;
    }

    move(dir, speed) {
        if (dir == "up") {
            if (!this.colliderCheck("up")) {
                this.y -= speed;
                this.updateHitbox();
                let c = this.colliderCheck("up");
                if (c != false) {
                    this.y = c.hitbox.bottom;
                    this.updateHitbox();
                    this.forces.vertical *= -1;
                }
            }
        }
        else if (dir == "down") {
            if (!this.colliderCheck("down")) {
                this.y += speed;
                this.updateHitbox();
                let c = this.colliderCheck("down");
                if (c != false) {
                    console.log("collided down")
                    this.y = c.hitbox.bottom;
                    this.updateHitbox();
                    this.forces.vertical *= -1;
                }
            }
        }
        else if (dir == "left") {
            if (!this.colliderCheck("left")) {
                this.x -= speed;
                this.updateHitbox();
                let c = this.colliderCheck("left");
                if (c != false) {
                    this.x = c.hitbox.right;
                    this.updateHitbox();
                    this.forces.horizontal *= -1;
                }
            }
        }
        else if (dir == "right") {
            if (!this.colliderCheck("right")) {
                this.x += speed;
                this.updateHitbox();
                let c = this.colliderCheck("right");
                if (c != false) {
                    console.log("Collided Right")
                    this.x = c.hitbox.left - this.w;
                    this.updateHitbox();
                    this.forces.horizontal *= -1;
                }
            }
        }
    }
}

class box extends obj {
    constructor(x, y, w, h, color) {
        super(x, y, w, h);
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (i in objs)
        objs[i].draw();
}

let wallInfo = {
    margin: {
        top: 40, bottom: 40, left: 40, right: 40
    },
    width: 30,
    color: "white"
}

let walls = {
    top: new box(wallInfo.margin.left, wallInfo.margin.top, canvas.width - wallInfo.margin.right - wallInfo.margin.left, wallInfo.width, wallInfo.color),
    bottom: new box(wallInfo.margin.left, canvas.height - wallInfo.width - wallInfo.margin.bottom, canvas.width - wallInfo.margin.right - wallInfo.margin.left, wallInfo.width, wallInfo.color),
    left: new box(wallInfo.margin.left, wallInfo.margin.top + wallInfo.width, wallInfo.width, canvas.height - wallInfo.margin.bottom - wallInfo.margin.top - wallInfo.width * 2, wallInfo.color),
    right: new box(canvas.width - wallInfo.margin.right - wallInfo.width, wallInfo.margin.top + wallInfo.width, wallInfo.width, canvas.height - wallInfo.margin.bottom - wallInfo.margin.top - wallInfo.width * 2, wallInfo.color),
};

let testBall = new box(1000, canvas.width / 2, 20, 20, "lightgreen");
//let testBox = new box(300, 0, 20, canvas.height, "red");

testBall.forces.vertical = 10;
testBall.forces.horizontal = 10;

function animate() {
    draw();
    for (let i in objs) {
        objs[i].update();
    }
    requestAnimationFrame(animate);
}
animate();