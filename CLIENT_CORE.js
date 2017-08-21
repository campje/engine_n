/*jslint devel: true, node: true, rhino: false, white: true, eqeq: true, forin: true, newcap: true, plusplus: true, unparam: true, sloppy: true, vars: true, maxerr: 55*/

/*
    CORE 
    
*/


// LOGS

var errors = {
    unknownKey: "key is unknown, you can't get the file. Make sure that the file name is a valid string.",
    loadError: "cannot be loaded, request error.",
    unknownFormat: "Sorry, this file format is not supported."
};


// MATH FUNCTIONS

function deltaSpeed(vel, delta) {
    return Math.round((vel * delta * 60) / 1000);
}

function randomBetweenNumbers(min, max) {
    return Math.floor((max - min) * Math.random()) + min;
}

function isNegative(nbr) {
    if (nbr < 0) {
        return true;
    }
}

function isPositive(nbr) {
    if (nbr > 0) {
        return true;
    }
}

function isNull(nbr) {
    if (nbr === 0) {
        return true;
    }
}

function minimumBetweenNumbers(first, second) {
    if (first < second) {
        return first;
    } else {
        return second;
    }
}

function maximumBetweenNumbers(first, second) {
    if (first > second) {
        return first;
    } else {
        return second;
    }
}

function angleVel(angle, speed) {
    return {
        vx: Math.cos(angle * Math.PI / 180) * speed,
        vy: Math.sin(angle * Math.PI / 180) * speed * -1
    };
}

function angleByPos(firstX, firstY, secondX, secondY) {
    return Math.round(180 - Math.atan2(secondY - firstY, secondX - firstX) * 180 / Math.PI);
}

function scale(width, height, factor) {
    return {
        width: width * factor,
        height: height * factor
    };
}


// PHYSICS


function on2AABBColision(aabb1, aabb2) {

    if ((aabb1.x >= aabb2.x + aabb2.width) || (aabb1.x + aabb1.width <= aabb2.x) || (aabb1.y >= aabb2.y + aabb2.height) || (aabb1.y + aabb1.height <= aabb2.y)) {
        return false;
    } else {
        return true;
    }

}

function onPointAABBColision(point, aabb) {

}


// GAME INSTANCE

function Game(model) {
    this.parent = document.querySelector(model.el);
    this.height = model.canvasHeight;
    this.width = model.canvasWidth;
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('id', "game_canvas");
    this.canvas.height = model.canvasHeight;
    this.canvas.width = model.canvasWidth;
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    this.parent.appendChild(this.canvas);
    this.now;
    this.delta;
    this.frameTime;
    this.t;
    this.later = new Date().getTime();
    this.update = model.update;
    this.render = model.render;
    this.imagesFormats = ["gif", "png", "jpg", "jpeg"];
    this.documentsFormats = ["json"];
    this.soundsFormats = ["mp3", "ogg", "flac", "mp4"];
    this.askedFiles;
    this.requiredFiles = [];
    this.loadedFiles = [];
    this.files = {};
    this.loaderCallback;

    this.camera = {
        x: 0,
        y: 0 //fixed or box
    };
}

Game.prototype.run = function () {
    this.tick();
};

Game.prototype.tick = function () {
    this.now = new Date().getTime();
    this.delta = this.now - this.later;
    this.context.clearRect(0, 0, this.width, this.height);
    this.update();
    this.render();
    this.later = this.now;
    requestAnimationFrame(this.tick.bind(this));
};

Game.prototype.getFPS = function () {
    return Math.round(1000 / this.delta);
};

Game.prototype.clearCanvas = function () {
    this.context.clearRect(0, 0, this.width, this.height);
};

Game.prototype.load = function (arr, callback) {
    this.askedFiles = arr;
    this.loaderCallback = callback;
    var typefounded = false;
    //identify file type
    for (var i = 0; i < this.askedFiles.length; i++) {
        for (var o = 0; o < this.imagesFormats.length; o++) {
            if (this.askedFiles[i].includes(this.imagesFormats[o])) {
                this.requiredFiles.push({
                    type: "image",
                    file: this.askedFiles[i],
                    key: this.askedFiles[i].split('/').reverse()[0].split('.')[0]
                });
                typefounded = true;
            }
        }
        for (var e = 0; e < this.soundsFormats.length; e++) {
            if (this.askedFiles[i].includes(this.soundsFormats[e])) {
                this.requiredFiles.push({
                    type: "sound",
                    file: this.askedFiles[i],
                    key: this.askedFiles[i].split('/').reverse()[0].split('.')[0]
                });
                typefounded = true;
            }
        }
        for (var a = 0; a < this.documentsFormats.length; a++) {
            if (this.askedFiles[i].includes(this.documentsFormats[a])) {
                this.requiredFiles.push({
                    type: "json",
                    file: this.askedFiles[i],
                    key: this.askedFiles[i].split('/').reverse()[0].split('.')[0]
                });
                typefounded = true;
            }
        }
    }

    if (typefounded === false) {
        console.log(errors.unknownFormat);
    }

    //loading all files
    for (var i = 0; i < this.requiredFiles.length; i++) {
        (function (i) {
            switch (this.requiredFiles[i].type) {
                case "image":

                    var img = new Image();
                    img.addEventListener('load', function (e) {
                        this.loadedFiles.push(img);
                        this.files[this.requiredFiles[i].key] = img;
                        if (this.requiredFiles.length === this.loadedFiles.length) {
                            this.loaderCallback();
                        }

                    }.bind(this), false);
                    img.addEventListener('error', function (e) {
                        console.error(this.requiredFiles[i].file + errors.loadError);
                    }.bind(this), false);
                    img.src = this.requiredFiles[i].file;

                    break;

                case "json":

                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', this.requiredFiles[i].file);
                    xhr.addEventListener('readystatechange', function () {
                        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                            this.loadedFiles.push(this.requiredFiles[i].file);
                            var jsonfile = JSON.parse(xhr.responseText);
                            this.files[this.requiredFiles[i].key] = jsonfile;
                            if (this.requiredFiles.length === this.loadedFiles.length) {
                                this.loaderCallback();
                            }
                        } else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status != 200) {
                            console.error(this.requiredFiles[i].file + errors.loadError);
                        }
                    }.bind(this), false);

                    xhr.send();

                    break;

                case "sound":

                    var sound = new Audio();
                    sound.addEventListener('canplaythrough', function (e) {
                        this.loadedFiles.push(sound);
                        this.files[this.requiredFiles[i].key] = sound;
                        if (this.requiredFiles.length === this.loadedFiles.length) {
                            this.loaderCallback();
                        }
                    }.bind(this), false);
                    sound.addEventListener('error', function (e) {
                        console.error(this.requiredFiles[i].file + errors.loadError);
                    }.bind(this), false);
                    sound.src = this.requiredFiles[i].file;
                    break;
            }

        }.bind(this))(i);
    }
};

Game.prototype.getFile = function (key) {
    if (this.files[key]) {

    } else {
        console.error(key + errors.unknownKey);
    }
    return this.files[key];
};

Game.prototype.getDownloadState = function () {
    return Math.round(this.loadedFiles.length / this.requiredFiles.length * 100);
};

Game.prototype.XtoSX = function (x) {
    return x - this.camera.x;
};

Game.prototype.YtoSY = function (y) {
    return y - this.camera.y;
};

Game.prototype.SXtoX = function (x) {
    return x + this.camera.x;
};

Game.prototype.SYtoY = function (y) {
    return y + this.camera.y;
};

Game.prototype.cameraFollow = function (model) {
    // model.x, y width, height
    this.camera.x = model.x - (this.canvas.width / 2);
    this.camera.y = model.y - (this.canvas.height / 2);
};

function Sprite(model) {

    this.image = model.image;
    this.sheetWidth = this.image.width;
    this.sheetHeight = this.image.height;
    this.width = this.sheetWidth / model.frames;
    this.height = this.sheetHeight / model.animations;
    this.animationNumber = model.animations;
    this.frameIndex = 0;
    this.framesNumber = model.frames;
    this.currentAnimation;
    this.loop = model.loop;
    this.tickCount = 0;
    this.tickPerFrame = model.speed;
    this.x = model.x;
    this.y = model.y;
    this.sx;
    this.sy;
    this.askedRightVel;
    this.askedLeftVel;
    this.askedTopVel;
    this.askedBottomVel;
    this.xvel = 0;
    this.yvel = 0;
    this.scaleFactor = model.scale;
    this.game = model.game;
    this.cgBottom = true;
    this.cgTop = true;
    this.cgLeft = true;
    this.cgRight = true;
    this.colideMap = false;
    this.colisionsTiles;
    this.gravity;

}

Sprite.prototype.update = function () {


    if (this.colideMap !== false) {
        this.colideMap.colideWith(this, this.colisionsTiles);
    }


    if (this.askedLeftVel !== 0) {
        if (this.cgLeft === true) {
            this.x -= this.askedLeftVel;
        } 

    }

    if (this.askedRightVel !== 0) {

        if (this.cgRight === true) {
            this.x += this.askedRightVel;
        } 

    }

    if (this.askedBottomVel !== 0) {

        if (this.cgBottom === true) {
            this.y += this.askedBottomVel;
        } 
    }

    if (this.askedTopVel !== 0) {
        
        if (this.cgTop === true) {
            this.y -= this.askedTopVel;   
        }
    }

    this.tickCount += 1;
    if (this.tickCount > this.tickPerFrame) {
        this.tickCount = 0;
        if (this.frameIndex < this.framesNumber - 1) {
            this.frameIndex += 1;
        } else if (this.loop === true) {
            this.frameIndex = 0;
        }
    }

    this.sx = this.game.XtoSX(this.x);
    this.sy = this.game.YtoSY(this.y);

};

Sprite.prototype.render = function (currentAnimation) {
    this.game.context.drawImage(
        this.image,
        this.frameIndex * this.width,
        currentAnimation * this.height,
        this.width,
        this.height,
        this.sx,
        this.sy,
        this.width * this.scaleFactor,
        this.height * this.scaleFactor
    );
};


Sprite.prototype.stopAnimation = function () {
    this.frameIndex = 0;
    this.loop = false;
};

Sprite.prototype.restartAnimation = function () {
    this.loop = true;
};

Sprite.prototype.moveLeft = function (askedVel) {
    this.askedLeftVel = askedVel;
    this.cgRight = true;
};

Sprite.prototype.moveRight = function (askedVel) {
    this.askedRightVel = askedVel;
    this.cgLeft = true;
};

Sprite.prototype.moveBottom = function (askedVel) {
    this.askedBottomVel = askedVel;
    this.cgTop = true;
};

Sprite.prototype.moveTop = function (askedVel) {
    this.askedTopVel = askedVel;
    this.cgBottom = true;
};

Sprite.prototype.colideWithMap = function(colideMap, colisionsTile) {
    this.colideMap = colideMap;
    this.colisionsTiles = colisionsTile;
};


function ParticleEmitter(model) {
    this.x = model.x;
    this.y = model.y;
    this.sx;
    this.sy;
    this.model = model;
    this.particles = [];
    this.particle = {};
    this.particle.image = this.model.image;
    this.particle.gravity = this.model.gravity;
    this.particle.speed = 0;
    this.particle.angle = 0;
    this.particle.life = this.model.life;
    this.particle.scale = this.model.scale;
    this.particle.lifeState = 0;
    this.particle.width = 0;
    this.particle.height = 0;
    this.particle.vx = 0;
    this.particle.vy = 0;
    this.mode = this.model.mode;
    this.game = model.game;
}

ParticleEmitter.prototype.addParticles = function (pnumber) {
    for (var i = 0; i < pnumber; i++) {
        var cModel = JSON.parse(JSON.stringify(this.particle));
        cModel.x = this.x;
        cModel.y = this.y;
        if (Array.isArray(this.model.image) === true) {
            //more than 1 image
            cModel.image = this.model.image[randomBetweenNumbers(0, this.model.image.length)];
        } else {
            //just 1 image
            cModel.image = this.model.image;
        }
        cModel.speed = randomBetweenNumbers(this.model.speed.min, this.model.speed.max);
        cModel.angle = randomBetweenNumbers(this.model.angle.min, this.model.angle.max);
        cModel.width = scale(cModel.image.width, cModel.image.height, cModel.scale).width;
        cModel.height = scale(cModel.image.width, cModel.image.height, cModel.scale).height;
        cModel.vx = angleVel(cModel.angle, cModel.speed).vx;
        cModel.vy = angleVel(cModel.angle, cModel.speed).vy;
        this.particles.push(cModel);
    }
};

ParticleEmitter.prototype.update = function () {
    this.sx = this.game.XtoSX(this.x);
    this.sy = this.game.YtoSY(this.y);
    for (var i = 0; i < this.particles.length; i++) {
        this.particles[i].sx = this.game.XtoSX(this.particles[i].x);
        this.particles[i].sy = this.game.YtoSY(this.particles[i].y);
        this.particles[i].x += this.particles[i].vx;
        this.particles[i].y += this.particles[i].vy;
        this.particles[i].vy += this.particles[i].gravity;
        this.particles[i].lifeState += 1;
        if (this.particles[i].lifeState >= this.particles[i].life) {
            this.particles.shift();
        }
    }
};

ParticleEmitter.prototype.render = function () {
    for (var i = 0; i < this.particles.length; i++) {
        this.game.context.drawImage(
            this.particles[i].image,
            this.particles[i].sx,
            this.particles[i].sy,
            this.particles[i].width,
            this.particles[i].height
        );
    }
};

function TileSet(image, tilesize) {
    this.image = image;
    this.width = this.image.width;
    this.height = this.image.height;
    this.tilesize = tilesize;
}

TileSet.prototype.getX = function (num) {
    return (num - 1) % (this.width / this.tilesize) * this.tilesize; //return x position by tile number
};

TileSet.prototype.getY = function (num) {
    return Math.floor((num - 1) / (this.width / this.tilesize)) * this.tilesize;
};



function TileMap(model) {

    this.game = model.game;
    //tileset
    this.tilesetImage = model.tileset;
    this.tileSize = model.tilesize;
    this.tileset = new TileSet(this.tilesetImage, this.tileSize);
    this.tilesetWidthInTile = this.tilesetImage.width / this.tileSize;
    this.tilesetHeightInTile = this.tilesetImage.height / this.tileSize;
    //tilemap
    this.mapData = model.data;
    this.mapWidthInTiles = this.mapData.map.length / model.data.cols;
    this.mapHeightInTiles = this.mapData.map.length / model.data.rows;
    this.mapWidthInPixels = this.mapWidthInTiles * this.tileSize;
    this.mapHeightInPixels = this.mapHeightInTiles * this.tileSize;
    this.scaleFactor = model.scale;
    this.displaySize = this.tileSize * this.scaleFactor;
}

TileMap.prototype.getX = function (num, scale) {
    return (num - 1) % (this.mapWidthInPixels / this.tileSize) * this.tileSize * scale; //return x position by tile number
};

TileMap.prototype.getY = function (num, scale) {
    return Math.floor((num - 1) / (this.mapWidthInPixels / this.tileSize)) * this.tileSize * scale;
};

TileMap.prototype.getTile = function (x, y) {
    return this.mapData.map[Math.round((y / this.displaySize)) * this.mapData.cols + Math.round((x / this.displaySize))];
};

TileMap.prototype.getTileIndex = function(x,y) {
  return Math.round((y / this.displaySize)) * this.mapData.cols + Math.round((x / this.displaySize));
};

TileMap.prototype.replaceTile = function(index, tile) {
  this.mapData.map[index] = tile;  
};

TileMap.prototype.getTileCoord = function (x, y) {
    return {
        x: Math.round(x / this.displaySize) * this.displaySize,
        y: Math.round(y / this.displaySize) * this.displaySize
    }
};


TileMap.prototype.render = function () {

    for (var i = 0; i < this.mapData.map.length; i++) {


        this.game.context.drawImage(
            this.tilesetImage,
            this.tileset.getX(this.mapData.map[i]),
            this.tileset.getY(this.mapData.map[i]),
            this.tileSize,
            this.tileSize,
            this.getX(i + 1, this.scaleFactor) - this.game.camera.x,
            this.getY(i + 1, this.scaleFactor) - this.game.camera.y,
            this.tileSize * this.scaleFactor,
            this.tileSize * this.scaleFactor
        );

    }


};

TileMap.prototype.tilesAround = function (el, uwTiles) {
    var tilesAroundArr = [];
    var ds = this.displaySize;

    for (var i = 0; i < Math.ceil((el.width * el.scaleFactor + ds * 2) / ds); i++) {
        for (var e = 0; e < Math.ceil((el.height * el.scaleFactor + ds * 2) / ds); e++) {

            if (uwTiles.indexOf(this.getTile(el.x - ds + i * ds, el.y - ds + e * ds)) > -1) {

                tilesAroundArr.push({
                    x: this.getTileCoord(el.x - ds + i * ds, el.y - ds + e * ds).x,
                    y: this.getTileCoord(el.x - ds + i * ds, el.y - ds + e * ds).y,
                    tile: this.getTile(el.x - ds + i * ds, el.y - ds + e * ds),
                    width: this.displaySize,
                    height: this.displaySize,
                    walkable: false
                });


            } else {
                tilesAroundArr.push({
                    x: this.getTileCoord(el.x - ds + i * ds, el.y - ds + e * ds).x,
                    y: this.getTileCoord(el.x - ds + i * ds, el.y - ds + e * ds).y,
                    tile: this.getTile(el.x - ds + i * ds, el.y - ds + e * ds),
                    width: this.displaySize,
                    height: this.displaySize,
                    walkable: true
                });
            }

        }
    }

    return tilesAroundArr;
};


TileMap.prototype.colideWith = function (el, uwTiles) { // el.x el.y el.width el.height
    var tilesAround = this.tilesAround(el, uwTiles);
    var ds = this.displaySize;

    
    if (isNull(el.askedBottomVel) && isNull(el.askedTopVel) && isNull(el.askedLeftVel) && isNull(el.askedRightVel)) {
        el.cgTop = true;
        el.cgBottom = true;
        el.cgRight = true;
        el.cgLeft = true;
    }

    for (var i = 0; i < tilesAround.length; i++) {
        
        if (tilesAround[i].walkable === false) {
            if (isPositive(el.askedBottomVel)) {
                // going bottom
                
                if (on2AABBColision({
                        x: el.x,
                        y: el.y + el.askedBottomVel,
                        width: el.width * el.scaleFactor,
                        height: el.height * el.scaleFactor
                    }, tilesAround[i])) {
                
                    el.cgBottom = false;
                    el.y = tilesAround[i].y - el.height * el.scaleFactor;   
                }
            }
            if (isPositive(el.askedTopVel)) {
                // going top
                if (on2AABBColision({
                        x: el.x,
                        y: el.y - el.askedTopVel,
                        width: el.width * el.scaleFactor,
                        height: el.height * el.scaleFactor
                    }, tilesAround[i])) {
                    
                    el.y = tilesAround[i].y + tilesAround[i].height;
                    el.cgTop = false;
                }
            }
            if (isPositive(el.askedRightVel)) {
                // going right
                if (on2AABBColision({
                        x: el.x + el.askedRightVel,
                        y: el.y,
                        width: el.width * el.scaleFactor,
                        height: el.height * el.scaleFactor
                    }, tilesAround[i])) {
                    
                    el.x = tilesAround[i].x - el.width * el.scaleFactor;
                    el.cgRight = false;
 
                }
            }
            if (isPositive(el.askedLeftVel)) {
                //going left
                if (on2AABBColision({
                        x: el.x - el.askedLeftVel,
                        y: el.y,
                        width: el.width * el.scaleFactor,
                        height: el.height * el.scaleFactor
                    }, tilesAround[i])) {

                    el.x = tilesAround[i].x + tilesAround[i].width;
                    el.cgLeft = false;
                }
            }
        }
    }

};


function MouseHandler(game) {
    this.offLeft = game.canvas.offsetLeft;
    this.offTop = game.canvas.offsetTop;
    this.x;
    this.y;
    this.game = game;
    this.CLICK = "click";
    this.DOWN = "mousedown";
    this.UP = "mouseup";
    this.MOVE = "mousemove";
    this.ENTER = "mouseenter";
    this.LEAVE = "mouseleave";
    this.mouseEvents = {};
}

MouseHandler.prototype.listen = function (arr) {
    for (var i = 0; i < arr.length; i++) {
        var ev = arr[i];
        if (ev === "mousedown") {
            document.addEventListener('mousedown', this.on_Down.bind(this));
            document.addEventListener('mouseup', this.on_Up.bind(this));
        } else if (ev === "mousemove") {
            document.addEventListener('mousemove', function (e) {
                this.x = e.pageX - this.offLeft;
                this.y = e.pageY - this.offTop;
            }.bind(this));
        } else if (ev === "mouseenter") {
            this.game.canvas.addEventListener('mouseenter', this.on_Enter.bind(this));
            this.game.canvas.addEventListener('mouseleave', this.on_Leave.bind(this));
        }
    }
};

MouseHandler.prototype.on_Down = function () {
    this.mouseEvents["mousedown"] = true;
};

MouseHandler.prototype.on_Up = function () {
    this.mouseEvents["mousedown"] = false;
};

MouseHandler.prototype.isDown = function () {
    return this.mouseEvents['mousedown'];
};

MouseHandler.prototype.on_Enter = function () {
    this.mouseEvents["mouseenter"] = true;
};

MouseHandler.prototype.on_Leave = function () {
    this.mouseEvents["mouseenter"] = false;
};

MouseHandler.prototype.isInside = function () {
    return this.mouseEvents['mouseenter'];
}


function KeyboardHandler(game) {
    this.Z = 90;
    this.S = 83;
    this.Q = 81;
    this.D = 98;
    this.W = 87;
    this.A = 65;
    this.SPACE = 32;
    this.ENTER = 13;
    this.ARROWTOP = 38;
    this.ARROWBOTTOM = 40;
    this.ARROWLEFT = 37;
    this.ARROWRIGHT = 39;
    this.keyboardEvents = {};
    this.askedEvents = [];
}

KeyboardHandler.prototype.listen = function (arr) {
    document.addEventListener('keydown', this.on_KeyDown.bind(this));
    document.addEventListener('keyup', this.on_KeyUp.bind(this));
    this.askedEvents = arr;
    for (var i = 0; i < arr.length; i++) {
        this.keyboardEvents[arr[i]] = false;
    }
};

KeyboardHandler.prototype.on_KeyDown = function (event) {
    if (event.keyCode in this.keyboardEvents) {
        this.keyboardEvents[event.keyCode] = true;
    }
};

KeyboardHandler.prototype.on_KeyUp = function (event) {
    if (event.keyCode in this.keyboardEvents) {
        this.keyboardEvents[event.keyCode] = false;
    }
};

KeyboardHandler.prototype.isDown = function (keyCode) {
    return this.keyboardEvents[keyCode];
};

KeyboardHandler.prototype.allUp = function () {
    var allup = true;
    for (var i = 0; i < this.askedEvents.length; i++) {
        if (this.keyboardEvents[this.askedEvents[i]] === true) {
            allup = false;
        }
    }
    return allup;
}

function TouchHandler(game) {
    this.offLeft = game.canvas.offsetLeft;
    this.offTop = game.canvas.offsetTop;
    this.x;
    this.y;
    this.game = game;
    this.START = "touchstart";
    this.END = "touchend";
    this.MOVE = "touchmove";
    this.touchEvents = {};
}

TouchHandler.prototype.listen = function (arr) {
    for (var i = 0; i < arr.length; i++) {
        var ev = arr[i];
        if (ev === "touchstart") {
            document.addEventListener('touchstart', this.on_Down.bind(this));
            document.addEventListener('mouseup', this.on_Up.bind(this));
        } else if (ev === "touchmove") {
            document.addEventListener('touchmove', function (e) {
                this.x = e.touches[0].pageX - this.offLeft;
                this.y = e.touches[0].pageY - this.offTop;
            }.bind(this));
        }
    }
};

TouchHandler.prototype.on_Down = function () {
    this.touchEvents["touchstart"] = true;
};

TouchHandler.prototype.on_Up = function () {
    this.touchEvents["touchstart"] = false;
};

TouchHandler.prototype.isDown = function () {
    return this.touchEvents['touchstart'];
};

function saveHandler(model, key) {
    this.save = model;
    this.saveKey = key;

    if (localStorage.getItem(this.saveKey) === null) {
        this.saveAll(this.save);
    }
}

saveHandler.prototype.getSave = function () {
    return JSON.parse(localStorage.getItem(this.saveKey));
};

saveHandler.prototype.saveAll = function (newobj) {
    localStorage.setItem(this.saveKey, JSON.stringify(newobj));
};
