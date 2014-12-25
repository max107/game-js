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

        cursors = game.input.keyboard.createCursorKeys();
        marker = game.add.graphics();
        marker.lineStyle(2, 0x000000, 1);
        marker.drawRect(0, 0, 32, 32);

        //on mouse click moves the ball to the clicked tile
        // game.input.onDown.add(function() {
        //     if (isMoving) {
        //         stopPath(player);
        //         erasePath();
        //     }

        //     marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
        //     marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;

        //     pathfinder.preparePathCalculation([0, 0], [layer.getTileX(marker.x), layer.getTileY(marker.y)]);
        //     result = pathfinder.calculatePath();
        //     drawPath();
        //     isMoving = true;
        // }, game);
    }

    //draws the path by creating sprites within an array (for more convenient destroying
    function drawPath() {
        drawList = [];
        for (var i = 0, l = result.length - 1; i <= l; i++) {
            if (i < l) drawList.push(game.add.sprite(result[i].y * tileHeight, result[i].x * tileWidth, '/pathPoint.png'));
            else drawList.push(game.add.sprite(result[i].y * tileHeight, result[i].x * tileWidth, '/pathFinish.png'));

        }
        player.bringToTop();
    };

    //empties the temp variable and flags movement as false, thus preventing the execution of other functions
    function stopPath(sprite) {
        isMoving = false;
        temp = null;
        sprite.body.velocity.x = 0;
        sprite.body.velocity.y = 0;
    };

    function findPathTo(tilex, tiley) {
        pathfinder.setCallbackFunction(function(path) {
            path = path || [];

            for (var i = 0, ilen = path.length; i < ilen; i++) {
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
        //if movement flag is true, the ball continues to move
        if (isMoving) {
            traversePath(player);
        }

        game.physics.arcade.collide(player, layer);

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

    function render() {

    }

    function traversePath(sprite) {
        //if this is the first time calling this function for the current path or one tile has already been traversed,
        //gets the coordinates of the next tile with result.shift() as in a FIFO structure
        //if the result array has been emptied, stops the pathwalking
        if (!temp || game.physics.arcade.distanceToXY(sprite, x, y) <= 4) {
            if (!result.length) {
                stopPath(sprite);
                erasePath();
                return;
            } else {
                temp = result.shift();

                //calculates the x and y coordinates towards which to move the ball
                x = temp.y * tileWidth + tileWidth / 2;
                y = temp.x * tileHeight + tileHeight / 2;
            }
        }
        //moves the ball
        //the ball DOES NOT stop moving once it has reached its goal, hence the distanceToXY()<=4 above
        //moveToXY(object to move, where to move X, where to move Y, speed);
        game.physics.arcade.moveToXY(sprite, x, y, 300);
    }

    //destroys path visuals
    function erasePath() {
        for (var i = 0; i < drawList.length; i++) {
            drawList[i].destroy();
        }
        list = null;
    }
});