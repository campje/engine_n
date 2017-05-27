var game = new Game({
    el: "#game",
    canvasHeight: 600,
    canvasWidth: 900,
    update: update,
    render: render
});


var files = ["/ressources/fourtileset.png", "/ressources/map2.json", "/ressources/ghost_sprite.png"];

var tileset;
var mapJSON;
var gameMap;
var keyboard;
var mouse;
var ghost;
var spriteanim = 0;
var gravity = 3;


game.load(files, onLoad);

function onLoad() {

    mapJSON = game.getFile("map2");
    tileset = game.getFile("fourtileset");

    gameMap = new TileMap({
        tileset: tileset,
        tilesize: 16,
        data: mapJSON,
        scale: 1
    });
    ghost = new Sprite({
        image: game.getFile("ghost_sprite"),
        frames: 8,
        animations: 2,
        speed: 2,
        loop: true,
        scale: 1,
        x: 500,
        y: 300
    });
    /*heartEmitter = new ParticleEmitter({
        x: 260,
        y: 280,
        gravity: 0.1,
        life: 60,
        scale: 2,
        speed: {
            min: 3,
            max: 5
        },
        angle: {
            min: 45,
            max: 135
        },
        image: coins
    });*/


    keyboard = new KeyboardHandler(game);
    keyboard.listen([keyboard.ARROWRIGHT, keyboard.ARROWLEFT, keyboard.ARROWBOTTOM, keyboard.ARROWTOP]);

    mouse = new MouseHandler(game);
    mouse.listen([mouse.DOWN, mouse.MOVE]);

    game.run();
}

// know how many tiles around an entity
var tilesArround = [];

function arround(x, y, w, h, tmap, game) {

    for (var i = 0; i < Math.ceil((w + tmap.tileSize * 2) / tmap.tileSize); i++) {
        for (var e = 0; e < Math.ceil((h + tmap.tileSize * 2) / tmap.tileSize); e++) {
            if (gameMap.getTile(game, x - tmap.tileSize + i * tmap.tileSize, y - tmap.tileSize + e * tmap.tileSize) === 7) {
                tilesArround.push({
                    x: gameMap.getTileCoord(game, x - tmap.tileSize + i * tmap.tileSize, y - tmap.tileSize + e * tmap.tileSize).x,
                    y: gameMap.getTileCoord(game, x - tmap.tileSize + i * tmap.tileSize, y - tmap.tileSize + e * tmap.tileSize).y,
                    tile: gameMap.getTile(game, x - tmap.tileSize + i * tmap.tileSize, y - tmap.tileSize + e * tmap.tileSize),
                    color: "green"
                });
            } else {
                tilesArround.push({
                    x: gameMap.getTileCoord(game, x - tmap.tileSize + i * tmap.tileSize, y - tmap.tileSize + e * tmap.tileSize).x,
                    y: gameMap.getTileCoord(game, x - tmap.tileSize + i * tmap.tileSize, y - tmap.tileSize + e * tmap.tileSize).y,
                    tile: gameMap.getTile(game, x - tmap.tileSize + i * tmap.tileSize, y - tmap.tileSize + e * tmap.tileSize),
                    color: "red"
                });

                OnAABBColision({
                    x: ghost.x,
                    y: ghost.y,
                    width: 16,
                    height: 16
                }, {
                    x: gameMap.getTileCoord(game, x - tmap.tileSize + i * tmap.tileSize, y - tmap.tileSize + e * tmap.tileSize).x,
                    y: gameMap.getTileCoord(game, x - tmap.tileSize + i * tmap.tileSize, y - tmap.tileSize + e * tmap.tileSize).y,
                    width: 16,
                    height: 16
                }, function() {
                    console.log("coooolide");
                });
            }
        }
    }

    return tilesArround;
}

var arroundPlayer;
var vel = 3;


function update() {

    arroundPlayer = arround(ghost.x, ghost.y, 16, 16, gameMap, game);
    //    ghost.y += gravity;

    if (keyboard.isDown(keyboard.ARROWRIGHT)) {
        game.camera.x += vel;
        ghost.x += vel;
        spriteanim = 0;
    } else if (keyboard.isDown(keyboard.ARROWLEFT)) {
        game.camera.x -= vel;
        ghost.x -= vel;
        spriteanim = 1;
    } else if (keyboard.isDown(keyboard.ARROWBOTTOM)) {
        game.camera.y += vel;
        ghost.y += vel;
    } else if (keyboard.isDown(keyboard.ARROWTOP)) {
        game.camera.y -= vel;
        ghost.y -= vel;
    }


    if (mouse.isDown()) {

    }


    ghost.update(game);


}

var truuuc;

function render() {
    gameMap.render(game);

    for (var i = 0; i < arroundPlayer.length; i++) {
        truuuc = tilesArround;
        game.context.fillStyle = arroundPlayer[i].color;
        game.context.fillRect(game.XtoSX(arroundPlayer[i].x), game.YtoSY(arroundPlayer[i].y), 16, 16);
    }

    ghost.render(spriteanim, game);

    tilesArround = [];
}
