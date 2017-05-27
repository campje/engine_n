/*jslint devel: true, node: true, rhino: false, white: true, eqeq: true, forin: true, newcap: true, plusplus: true, unparam: true, sloppy: true, vars: true, maxerr: 55*/

/*
    CORE 
    
*/

// MATH FUNCTIONS

function log(arg) {
    console.log(arg);
}

function deltaSpeed(vel, delta) {
    return Math.round((vel * delta * 60) / 1000);
}

function sizeInTile(number, tilesize) {
    return number * tilesize;
}

function randomBetweenNumbers(min, max) {
    return Math.floor((max - min) * Math.random()) + min;
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


function OnAABBColision(first, second, callbck) {

    if ((first.x >= second.x + second.width)||(first.x + first.width <= second.x)||(first.y >= second.y + second.height)||(first.y + first.height <= second.y))  {
    } else {
        callbck();
    }

}

function onSideAABBColision(first, second, callbckobj) {
    /* callbckobj.top() callbckobj.bottom() callbckobj.left() callbckobj.right() */
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

Game.prototype.accessContext = function () {
    return this.context;
};

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

    //identify file type
    for (var i = 0; i < this.askedFiles.length; i++) {
        for (var o = 0; o < this.imagesFormats.length; o++) {
            if (this.askedFiles[i].includes(this.imagesFormats[o])) {
                this.requiredFiles.push({
                    type: "image",
                    file: this.askedFiles[i],
                    key: this.askedFiles[i].split('/').reverse()[0].split('.')[0]
                });
            }
        }
        for (var e = 0; e < this.soundsFormats.length; e++) {
            if (this.askedFiles[i].includes(this.soundsFormats[e])) {
                this.requiredFiles.push({
                    type: "sound",
                    file: this.askedFiles[i],
                    key: this.askedFiles[i].split('/').reverse()[0].split('.')[0]
                });
            }
        }
        for (var a = 0; a < this.documentsFormats.length; a++) {
            if (this.askedFiles[i].includes(this.documentsFormats[a])) {
                this.requiredFiles.push({
                    type: "json",
                    file: this.askedFiles[i],
                    key: this.askedFiles[i].split('/').reverse()[0].split('.')[0]
                });
            }
        }
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
                        console.error(this.requiredFiles[i].file + " cannot be loaded");
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
                            console.error(this.requiredFiles[i].file + " cannot be loaded");
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
                        console.error(this.requiredFiles[i].file + " cannot be loaded");
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
        console.error(key + ": unknown key can't access file");
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

function Sprite(model) {

    this.image = model.image;
    this.width = this.image.width;
    this.height = this.image.height;
    this.frameW = this.width / model.frames;
    this.frameH = this.height / model.animations;
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
    this.scaleFactor = model.scale;
}

Sprite.prototype.update = function (game) {
    this.sx = game.XtoSX(this.x);
    this.sy = game.YtoSY(this.y);
    this.tickCount += 1;
    if (this.tickCount > this.tickPerFrame) {
        this.tickCount = 0;
        if (this.frameIndex < this.framesNumber - 1) {
            this.frameIndex += 1;
        } else if (this.loop === true) {
            this.frameIndex = 0;
        }
    }

};

Sprite.prototype.render = function (currentAnimation, game) {
    game.context.drawImage(
        this.image,
        this.frameIndex * this.frameW,
        currentAnimation * this.frameH,
        this.frameW,
        this.frameH,
        this.sx,
        this.sy,
        this.frameW * this.scaleFactor,
        this.frameH * this.scaleFactor
    );
};


Sprite.prototype.stopAnimation = function () {
    this.frameIndex = 0;
    this.loop = false;
};

Sprite.prototype.restartAnimation = function () {
    this.loop = true;
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

ParticleEmitter.prototype.update = function (game) {
    this.sx = game.XtoSX(this.x);
    this.sy = game.YtoSY(this.y);
    for (var i = 0; i < this.particles.length; i++) {
        this.particles[i].sx = game.XtoSX(this.particles[i].x);
        this.particles[i].sy = game.YtoSY(this.particles[i].y);
        this.particles[i].x += this.particles[i].vx;
        this.particles[i].y += this.particles[i].vy;
        this.particles[i].vy += this.particles[i].gravity;
        this.particles[i].lifeState += 1;
        if (this.particles[i].lifeState >= this.particles[i].life) {
            this.particles.shift();
        }
    }
};

ParticleEmitter.prototype.render = function (game) {
    for (var i = 0; i < this.particles.length; i++) {
        game.context.drawImage(
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
}

TileMap.prototype.getX = function (num, scale) {
    return (num - 1) % (this.mapWidthInPixels / this.tileSize) * this.tileSize * scale; //return x position by tile number
};

TileMap.prototype.getY = function (num, scale) {
    return Math.floor((num - 1) / (this.mapWidthInPixels / this.tileSize)) * this.tileSize * scale;
};

TileMap.prototype.getTile = function (game, x, y) {
    return this.mapData.map[Math.round((y / this.tileSize)) * this.mapData.cols + Math.round((x / this.tileSize))];
};

TileMap.prototype.getTileCoord = function (game, x, y) {
    return {
        x: Math.round(x / this.tileSize) * this.tileSize,
        y: Math.round(y / this.tileSize) * this.tileSize
    }
}


TileMap.prototype.render = function (game) {

    for (var i = 0; i < this.mapData.map.length; i++) {


        if (this.getX(i + 1, this.scaleFactor) - game.camera.x + this.tileSize < 0 || this.getY(i + 1, this.scaleFactor) - game.camera.y + this.tileSize < 0 ||
            this.getX(i + 1, this.scaleFactor) - game.camera.x > game.canvasWidth ||
            this.getX(i + 1, this.scaleFactor) - game.camera.x > game.canvasHeight) {
            // avoid useless drawcalls
        } else {

            game.context.drawImage(
                this.tilesetImage,
                this.tileset.getX(this.mapData.map[i]),
                this.tileset.getY(this.mapData.map[i]),
                this.tileSize,
                this.tileSize,
                this.getX(i + 1, this.scaleFactor) - game.camera.x,
                this.getY(i + 1, this.scaleFactor) - game.camera.y,
                this.tileSize * this.scaleFactor,
                this.tileSize * this.scaleFactor
            );

        }

    }

};

TileMap.prototype.colideWith = function (model) { // model.x model.y model.width model.height

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
}

KeyboardHandler.prototype.listen = function (arr) {
    document.addEventListener('keydown', this.on_KeyDown.bind(this));
    document.addEventListener('keyup', this.on_KeyUp.bind(this));

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
                this.y = e.touches[0].pageY - this.offTop;;
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
