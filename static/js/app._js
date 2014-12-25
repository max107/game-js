var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', {
    preload: preload,
    create: create
});

function preload() {
    game.load.image('arrow', 'assets/car90.png');
}

var player;
var tween;

function create() {
    player = game.add.sprite(32, 32, 'arrow');
    player.anchor.setTo(0.5, 0.5);
    //game.physics.enable(player);
    game.input.onDown.add(movePlayer, this);
}

function movePlayer(pointer) {
    if (tween && tween.isRunning) {
        tween.stop();
    }
    player.rotation = game.physics.arcade.angleToPointer(player, pointer);
    var duration = (game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
    tween = game.add.tween(player).to({x: pointer.x, y: pointer.y}, duration, Phaser.Easing.Linear.None, true);
}