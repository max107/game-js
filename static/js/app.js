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
        game.load.image('tiles', 'assets/tmw_desert_spacing.png');
        game.load.image('car', 'assets/car90.png');
    }

    var map;
    var tileset;
    var layer;
    var pathfinder;

    var cursors;
    var player;
    var marker;
    var blocked = false;

    var drawList;
    var isMoving = false;

    var tileWidth; //tilemap grid cell width
    var tileHeight; //tilemap grid cell height
    var x = 0; //x coordinates for moving the ball
    var y = 0; //y coordinates for moving the ball
    var temp; //variable for storing the next tile to move towards

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        map = game.add.tilemap('desert');
        map.addTilesetImage('Desert', 'tiles');
        map.setCollisionByExclusion([30]);

        tileWidth = map.tileWidth;
        tileHeight = map.tileHeight;

        currentTile = map.getTile(2, 3);
        layer = map.createLayer('Ground');
        layer.resizeWorld();

        var walkables = [30];

        pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
        pathfinder.setGrid(map.layers[0].data, walkables);

        player = game.add.sprite(450, 80, 'car');
        player.anchor.setTo(0.5, 0.5);

        game.physics.enable(player);
        game.camera.follow(player);

        game.canvas.oncontextmenu = function(e) {
            e.preventDefault();
            contextMenu();
        };

        cursors = game.input.keyboard.createCursorKeys();
        marker = game.add.graphics();
        marker.lineStyle(2, 0x000000, 1);
        marker.drawRect(0, 0, 32, 32);
    }

    function findPathTo(tilex, tiley) {
        pathfinder.setCallbackFunction(function(path) {
            path = path || [];

            for (var i = 0, ilen = path.length; i < ilen; i++) {
                game.physics.arcade.collide(player, layer);
                //calculates the x and y coordinates towards which to move the ball
                var x = path[i].x * tileWidth + tileWidth / 2;
                var y = path[i].y * tileHeight + tileHeight / 2;
                game.physics.arcade.moveToXY(player, x, y, 300);
                //     (function(i) {
                //         setTimeout(function() {
                //             var currentTile;
                //             map.putTile(46, path[i].x, path[i].y);
                //             if (path[i - 1] != undefined) {
                //                 currentTile = map.getTile(layer.getTileX(path[i - 1].x), layer.getTileY(path[i - 1].y));
                //                 map.putTile(30, path[i - 1].x, path[i - 1].y);
                //             }
                //         }, i * 50);
                //     })(i);
            }
            blocked = false;
        });

        pathfinder.preparePathCalculation([0, 0], [tilex, tiley]);
        pathfinder.calculatePath();
    }

    function update() {
        game.physics.arcade.collide(player, layer);
        game.physics.arcade.moveToXY(player, x, y, 300);

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        player.body.angularVelocity = 0;

        if (cursors.left.isDown) {
            player.body.angularVelocity = -200;
        } else if (cursors.right.isDown) {
            player.body.angularVelocity = 200;
        }

        if (cursors.up.isDown) {
            player.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(player.angle, 300));
        }

        marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
        marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;

        if (game.input.mousePointer.isDown) {
            blocked = true;
            findPathTo(layer.getTileX(marker.x), layer.getTileY(marker.y));
        }
    }

    function contextMenu() {
        console.log(123);
    }

    function render() {

    }
});