let game;
let canvas;
const gameWidth = 10;
const gameHeight = 20;
const blockSize = 40;
const padding = 5 * blockSize;
let paused = false;

let gameMusic;

function preload() {
    soundFormats("mp3");
    gameMusic = loadSound("music");
}

function setup() {
    'use strict';
    canvas = createCanvas(gameWidth * blockSize + 2 * padding, gameHeight * blockSize);
    canvas.position(displayWidth / 2 - width / 2, 100) //set the x position such that center of canvas is center of screen (assumed browser is fullscreen)
    textAlign(CENTER); //draw text at center of bounding box
    gameMusic.loop();
    game = new Game(gameWidth, gameHeight, blockSize, padding);
    noLoop();
    game.drawGrid();

    displayTimer(6, 0); //call with one higher than first value to display
}

function centerCanvas() {
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    canvas.position(x, y);
}

function windowResized() {
    centerCanvas();
}

function draw() {
    game.draw()

    //for debugging
    // if (mouseIsPressed) {
    //     fill(color(0,0,0))
    //     textSize(32);
    //     text(""+mouseX+", "+mouseY, mouseX, mouseY)
    // }
}

function displayTimer(time, offset) {
    if (time > 0) {
        fill(color(0, 0, 0))
        textSize(72);
        text(time, padding + gameWidth * blockSize / 2, gameHeight * blockSize / 4 + offset)
        setTimeout(() => {
            displayTimer(time - 1, offset + blockSize * 2)
        }, 1000);
    } else {
        loop();
    }

}

function keyPressed() {
    switch (keyCode) {
        case LEFT_ARROW:
            game.moveLeftRight("LEFT")
            break;
        case RIGHT_ARROW:
            game.moveLeftRight("RIGHT")
            break;
        case UP_ARROW:
            game.rotateShape()
            break;
        case DOWN_ARROW:
            game.moveDown();
            break;
        case 32: //spacebar
            var canMoveDown = true;
            while (canMoveDown) {
                canMoveDown = game.moveDown();
            }
            break;
        case 80: //p
            if (paused) {
                resume()
                paused = false;
            } else {
                pause();
                paused = true;
            }
            break;
        case 72: //h
            game.holdShape();
    }
}

function pause() {
    noLoop();
}

function resume() {
    loop();
}
