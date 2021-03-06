$(function() {
    var width = $(window).width(),
        height = $(window).height();

    var params = {
        preload: preload,
        create: create,
        update: update,
        render: render
    };

    var game = new Phaser.Game(width, height, Phaser.AUTO, 'gameContainer', params);

    function preload() {
        game.load.tilemap('desert', 'assets/desert.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/tmw_desert_spacing1.png');
        game.load.image('car', 'assets/car90.png');
    }

    var map;
    var tileset;
    var layer;
    var pathfinder;

    var tween;
    var cursors;
    var player;
    var marker;

    var isMoving = false;

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        map = game.add.tilemap('desert');
        map.addTilesetImage('Desert', 'tiles');

        layer = map.createLayer('Ground');
        layer.resizeWorld();

        // var walkables = [30, 4, 5, 6, 7, 8, 12, 13, 14, 15, 16, 22, 23, 24, 31, 38, 39, 40, 47, 48, 34];
        var walkables = [30];

        pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
        pathfinder.setGrid(map.layers[0].data, walkables);

        player = game.add.sprite(450, 128, 'car');
        // player.anchor.setTo(0.5, 0.5);

        game.physics.enable(player);
        game.camera.follow(player);

        // game.input.onDown.add(movePlayer, this);
        // game.canvas.oncontextmenu = function(e) {
        //     e.preventDefault();
        //     contextMenu();
        // };

        cursors = game.input.keyboard.createCursorKeys();
        marker = game.add.graphics();
        marker.lineStyle(2, 0x000000, 1);
        marker.drawRect(0, 0, 32, 32);
    }

    function update() {
        marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
        marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;

        game.physics.arcade.collide(player, layer);

        if (tween && tween.isRunning) {
            tween.stop();
        }

        if (game.input.mousePointer.isDown) {
            if (Phaser.Rectangle.contains(player.body, game.input.x, game.input.y)) {
                player.body.velocity.setTo(0, 0);
            } else {
                pathfinder.setCallbackFunction(function(path) {
                    path = path || [];

                    // var duration = (game.physics.arcade.distanceToPointer(player, game.input.activePointer) / 300) * 300;
                    var duration = 100;

                    movePlayer = game.add.tween(player);
                    scalePlayer = game.add.tween(player.scale);
                    rotatePlayer = game.add.tween(player.anchor);

                    for (var i = 0, ilen = path.length; i < ilen; i++) {
                        map.putTile(i + 1 == ilen ? 50 : 49, path[i].x, path[i].y);

                        var targetAngle = game.math.angleBetween(
                            player.x, player.y,
                            path[i].x * 32, path[i].y * 32
                        );

                        // scalePlayer.to({
                        //     x: -1
                        // }, 1, Phaser.Easing.Linear.None);

                        // var angleX = 0,
                        //     angleY = 0;
                        // if (targetAngle < 0) {
                        //     angleX = 1;
                        //     angleY = 0;
                        // } else if (targetAngle > 3) {
                        //     angleX = 1;
                        //     angleY = 1;
                        // } else if (targetAngle > 1) {
                        //     angleX = 0;
                        //     angleY = 1;
                        // }

                        // rotatePlayer.to({
                        //     x: angleX,
                        //     y: angleY
                        // }, duration, Phaser.Easing.Linear.None);
                        
                        // movePlayer.chain(scalePlayer.to({
                        //     x: -1
                        // }, 1, Phaser.Easing.Linear.None).chain(rotatePlayer.to({
                        //     y: 0
                        // }, 1, Phaser.Easing.Linear.None)));

                        movePlayer.to({
                            // rotation: targetAngle,
                            x: path[i].x * 32,
                            y: path[i].y * 32
                        }, duration, Phaser.Easing.Linear.None);
                    }
                    movePlayer.start();
                });

                pathfinder.preparePathCalculation(
                    [layer.getTileX(player.x), layer.getTileY(player.y)], [layer.getTileX(marker.x), layer.getTileY(marker.y)]
                );
                pathfinder.calculatePath();
            }
        } else {
            player.body.velocity.setTo(0, 0);
        }

        // if (isMoving && Phaser.Rectangle.contains(player.body, game.input.x, game.input.y)) {
        //     player.body.velocity.setTo(0, 0);
        //     isMoving = false;
        // }

        // if (game.input.mousePointer.isDown) {
        //     game.physics.arcade.moveToPointer(player, 400);
        //     if (Phaser.Rectangle.contains(player.body, game.input.x, game.input.y)) {
        //         player.body.velocity.setTo(0, 0);
        //     }
        // } else {
        //     player.body.velocity.setTo(0, 0);
        // }

        // player.body.velocity.x = 0;
        // player.body.velocity.y = 0;
        // player.body.angularVelocity = 0;

        // if (cursors.left.isDown) {
        //     player.body.angularVelocity = -200;
        // } else if (cursors.right.isDown) {
        //     player.body.angularVelocity = 200;
        // }
        // if (cursors.up.isDown) {
        //     player.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(player.angle, 300));
        // }
    }

    function movePlayer(pointer) {
        if (tween && tween.isRunning) {
            tween.stop();
        }

        player.rotation = game.physics.arcade.angleToPointer(player, pointer);
        var duration = (game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
        tween = game.add.tween(player).to({
            x: pointer.x,
            y: pointer.y
        }, duration, Phaser.Easing.Linear.None, true);
    }

    function contextMenu() {
        console.log('context menu');
    }

    function render() {

    }
});