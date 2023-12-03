var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var player;
var platforms;

function preload() {
    this.load.image('galaxy', 'assets/galaxy.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.spritesheet('rat', 'assets/rat.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {
    this.add.image(400, 300, 'galaxy');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(0.5).refreshBody();

    player = this.physics.add.sprite(100, 450, 'rat');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('rat', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'rat', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('rat', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(player, platforms);
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-200);
    }
}