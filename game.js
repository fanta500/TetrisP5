let currentShapeIsDead = false;
let gameOver = false;

class Game {
    constructor(gameWidth, gameHeight, blockSize, padding) {
        this.padding = padding;
        this.blockSize = blockSize;
        this.shapegenerator = new Shapegenerator(this.blockSize);
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.linesCleared = 0;
        this.gameGrid = this.initGameGrid();
        this.deadBlocks = []; //when a shape dies, split it into all its individual blocks

        this.drawGrid();
        
        this.heldShape = null;
        this.currentShape = this.shapegenerator.generateShape();
        this.nextShape = this.shapegenerator.generateShape();

        this.updateGameGrid();
    }

    drawGrid() {
        //draws all the vertical lines
        for (var i = 0; i <= this.gameWidth; i++) {
            line(i*this.blockSize+padding, 0, i*this.blockSize+padding, this.gameHeight*this.blockSize)
        }
        //draws all the horizontal lines
        for (var i = 0; i <= this.gameHeight; i++) {
            line(padding, i*this.blockSize, this.gameWidth*this.blockSize+padding, i*this.blockSize)
        }
    }

    initGameGrid() {
        //initialize the game grid array.
        /*
            "free" means that nothing is in this slot
            "dead" means that a previous shape takes up this slot
            "current" means that this slot is currently taken by a block of the current shape
        */
        var grid = [];

        for (var i = 0; i < this.gameHeight; i++) {
            grid[i] = [];
        }
        for (var i = 0; i < this.gameHeight; i++) {
            for (var j = 0; j < this.gameWidth; j++) {
                grid[i][j] = "free";
            }
        }

        return grid;
    }

    updateGameGrid() {
        //set the status of grid spots taken up by current shape blocks to "current"
        this.currentShape.blocks.forEach(block => {
            var indexes = this.translateCoordinateToGridIndex(block.x, block.y);
            var column = indexes[0];
            var row = indexes[1];

            this.gameGrid[row][column] = "current";
        });

        return true;
    }

    setGameGridToFree() {
        //set the status of grid spots taken up by current shape blocks to "free"
        //this gets called just before a move is made, and then updateGameGrid() will set the new position to current
        this.currentShape.blocks.forEach(block => {
            var indexes = this.translateCoordinateToGridIndex(block.x, block.y);
            var column = indexes[0];
            var row = indexes[1];

            this.gameGrid[row][column] = "free";
        });

        return true;
    }

    getNextShape() {
        return _.cloneDeep(this.nextShape); //lodash deep clone of nextShape object
    }

    setNextShape() {
        return this.shapegenerator.generateShape(); //generate a new nextShape
    }

    drawNextShape() {     
        //draw the next shape away from the action
        this.nextShape.getBlocks().forEach(block => {
            block.drawNextShape(300);
        });
    }

    drawDeadBlocks() {
        //for every dead block in the dead blocks list, draw it to the canvas
        this.deadBlocks.forEach(block => {
            if (block.getY() < this.gameHeight * this.blockSize) block.draw();
        });
    }

    drawText() {
        //next shape text and lines cleared / score text
        push();
        fill(color(0,0,0)); 
        textSize(32);
        text("Next shape:", this.gameWidth*this.blockSize + this.padding*1.5, 50);
        text("Held shape:", this.padding/2, 50)
        text("Score: " + this.linesCleared.toString(), this.padding/2, this.gameHeight/2*this.blockSize);
        pop();
    }

    restart() {
        gameOver = false;
        this.linesCleared = 0;
        this.gameGrid = this.initGameGrid();
        this.deadBlocks = [];
        this.heldShape = null;

        this.drawGrid();
        
        this.currentShape = this.shapegenerator.generateShape();
        this.nextShape = this.shapegenerator.generateShape();
    }

    draw() {
        //clear the canvas
        clear();
        //draw the background
        background(color(250,250,250));
        //draw the grid
        this.drawGrid();
        //draw the dead blocks
        this.drawDeadBlocks();
        //draw the next shape
        this.drawNextShape();
        //draw all text elements
        this.drawText();
        //draw the held shape if != null
        if (this.heldShape != null) {
            this.heldShape.getBlocks().forEach(block => {
                block.drawHeldShape(-300);
            });
        }
        //check to see if current shape has any block in "dead" gamegrid slot => restart game
        this.checkIfGameOver();
        //if game is not over, draw the current shape
        if (!gameOver) {
            this.currentShape.blocks.forEach(block => {
                block.draw();
            });
        } else {
            window.alert("Game over! \n" + "Press OK to start a new game!")
            this.restart() //game over
        }

        if (frameCount % 25 === 0) { //perform move once every N frames 
            this.moveDown();
        }
    }

    checkIfGameOver() {
        //check if game is over
        this.currentShape.getBlocks().forEach(block => { 
            var indexes = this.translateCoordinateToGridIndex(block.x, block.y);
            var column = indexes[0]; //column index
            var row = indexes[1]; //row index
            if (this.gameGrid[row][column] === "dead") {
                gameOver = true;
            }
        });
    }

    clearLine() {
        var deadLineIndexes = [];
        for (var i = 0; i < this.gameGrid.length ; i++) {
            if (this.gameGrid[i].every(this.checkIfDead)) { // check if every element of the current row is "dead"
                deadLineIndexes.push(i);
            }          
        }

        if (deadLineIndexes.length === 0) {
            return false; //no lines to clear
        }
        
        deadLineIndexes.forEach(deadLine => {
            this.updateGameGridAfterLineClear(deadLine);   
            this.updateDeadBlocks(deadLine);
        }) 
        
        this.linesCleared += deadLineIndexes.length;

        return true; //cleared some lines
    }

    updateDeadBlocks(row) {
        if (row > 0) {
            this.deadBlocks.forEach(block => {
                var coordinates = this.translateGridIndexToCoordinate(null, row);
                var yOfLineToClear = coordinates[1];

                if (block.getY() === yOfLineToClear) { //move block off frame
                    block.setY(this.blockSize*this.gameHeight)
                }
                if (block.getY() < yOfLineToClear) { // move all blocks above line to clear one grid slot down
                    block.setY(block.getY()+this.blockSize);
                }
                block.draw();
            })
        } 
        return true;
    }

    updateGameGridAfterLineClear(row) {
        if (row > 0) {
            for (let i = row; i > 0; i--) {
                this.gameGrid[i] = this.gameGrid[i-1];
            }

            // for (let col = 0; col < this.gameWidth; col++) {
            //     this.gameGrid[0][col] = "free";
            // }
            //for some reason this works, and the above for loop does not
            this.gameGrid[0] = ["free","free","free","free","free","free","free","free","free","free"];
            
        } 
        
        return true;
    }

    checkIfDead(element) { // helper function to determine if an entire row is dead
        return element === "dead";
    }

    moveDown() {
        if (this.canMoveDown()) { //check if shape can be moved down, if it can't it's dead
            this.setGameGridToFree();  
            this.currentShape.moveDown();
            this.updateGameGrid();
            return true;
        } else { // shape is now dead, deal with it
            this.handleDeadShape();
            return false;
        }
    }

    handleDeadShape() {
        this.currentShape.blocks.forEach(block => {
            var indexes = this.translateCoordinateToGridIndex(block.x, block.y); //find the game grid index of the dead shape blocks
            var column = indexes[0]; //column index
            var row = indexes[1]; //row index

            this.gameGrid[row][column] = "dead";
        });

        this.currentShape.getBlocks().forEach(block => { // add all the blocks of the shape individually to dead block list
            this.deadBlocks.push(block);
        });
        
        this.currentShape = this.getNextShape(); //returns a copy of the current nextShape object
        this.nextShape = this.setNextShape(); //set the nextShape object to a new random shape
        this.clearLine();
    }

    translateCoordinateToGridIndex(xCoord, yCoord) {
        //translates coordinates to grid indexes
        var positionXToIndexX = xCoord / this.blockSize - this.padding / this.blockSize; //columns in grid
        var positionYToIndexY = yCoord / this.blockSize; //rows in grid

        return [positionXToIndexX, positionYToIndexY];
    }

    translateGridIndexToCoordinate(xIndex, yIndex) {
        //translates grid indexes to coordinates
        var indexXtoPositionX = xIndex * this.blockSize + this.padding; // x axis
        var indexYtoPositionY = yIndex * this.blockSize; // y axis

        return [indexXtoPositionX, indexYtoPositionY];
    }

    canMoveDown() {
        var canMoveDown = true;

        this.currentShape.getBlocks().forEach(block => {
            //translate vector position to grid indexes
            var indexes = this.translateCoordinateToGridIndex(block.x, block.y);
            var column = indexes[0];
            var row = indexes[1];

            //if the bottom of any block currently is at the lowest blocks, move cannot happen
            if (row === this.gameGrid.length-1) {
                canMoveDown = false;
                return canMoveDown; //shape at the bottom already
            } 
            //if the gameGrid array says the next position is "dead" the move is not eligible
            else if (this.gameGrid[row+1][column] === "dead") {
                canMoveDown = false;
                return canMoveDown;
            }
        })

        return canMoveDown;
    }
    
    moveLeftRight(direction) {
        switch (direction) {
            case "LEFT":
                var moveEligible = true;
                //check every block of current shape. If a single on cannot move, the shape cannot move
                this.currentShape.getBlocks().forEach(block => { 
                    var indexes = this.translateCoordinateToGridIndex(block.x, block.y);
                    var column = indexes[0];
                    var row = indexes[1];

                    if (block.x - this.blockSize < padding) { // check to see if move would put you to the left of the game area
                        moveEligible = false;
                    } else if (this.gameGrid[row][column-1] === "dead") { //check to see if the move would put you onto a dead grid slot
                        moveEligible = false;
                    }
                });
                if (moveEligible) {
                    this.setGameGridToFree();
                    this.currentShape.moveLeftRight("LEFT")
                    this.updateGameGrid();
                }
                break;
            case "RIGHT":
                var moveEligible = true;
                //check every block of current shape. If a single on cannot move, the shape cannot move
                this.currentShape.getBlocks().forEach(block => {
                    var indexes = this.translateCoordinateToGridIndex(block.x, block.y);
                    var column = indexes[0];
                    var row = indexes[1];

                    if (block.x + this.blockSize >= padding + this.gameWidth*this.blockSize) { // check to see if move would put you to the right of the game area
                        moveEligible = false;
                    } else if (this.gameGrid[row][column+1] === "dead") { //check to see if the move would put you onto a dead grid slot
                        moveEligible = false;
                    }
                });
                if (moveEligible) {
                    this.setGameGridToFree();
                    this.currentShape.moveLeftRight("RIGHT")
                    this.updateGameGrid();
                }
                break;
        }
    }

    canRotateShape() {
        var futureShapeCoordinates = [];

        /*
            Iterate over every block, and find its future position on the game grid
            If one block encounters a spot which not free, shape cannot rotate
            If function does not return false, then every block could rotate, and so do just that
        */
        this.currentShape.getBlocks().forEach(block => {
            //gotta work with the center of each block
            var currentBlockCenterX = block.getX() + this.blockSize/2;
            var currentBlockCenterY = block.getY() + this.blockSize/2;
            var shapeRotationPoint = this.currentShape.getRotationPoint();

            //calculate current x and y dist from block center to rotate point
            var currentDistX = currentBlockCenterX - shapeRotationPoint.x;
            var currentDistY = currentBlockCenterY - shapeRotationPoint.y;

            //standard vector rotation 90 degrees
            var futureDistX = -currentDistY;
            var futureDistY = currentDistX;

            //calculate future block center coordinates
            var futureBlockCenterX = shapeRotationPoint.x + futureDistX;
            var futureBlockCenterY = shapeRotationPoint.y + futureDistY;

            //revert back to block corner points
            var futureCoordinates = createVector(futureBlockCenterX - this.blockSize/2, futureBlockCenterY - this.blockSize/2);

            //convert coordinates to indexes to check for availability
            var futureBlockIndex = this.translateCoordinateToGridIndex(futureCoordinates.x, futureCoordinates.y);
            var futureColumn = futureBlockIndex[0];
            var futureRow = futureBlockIndex[1];

            //determine if block can be rotated
            if (futureColumn < 0 || futureColumn > this.gameWidth-1) {
                return {flag: false, futureIndexes: []};
            } else if (futureRow < 0 || futureRow > this.gameHeight-1) {
                return {flag: false, futureIndexes: []};
            } else if (!this.gameGrid[futureRow][futureColumn] === "free" || this.gameGrid[futureRow][futureColumn] === "dead") {
                return {flag: false, futureIndexes: []};
            } else {
                futureShapeCoordinates.push(futureCoordinates);
            }
        });

        /*
            This is necessary because (i think) the last or first block doesn't pass the checks above
            When this happens, we still get to the bottom return true statement with insufficient index length
        */
        if (futureShapeCoordinates.length != this.currentShape.getBlocks().length) {
            return {flag: false, futureIndexes: []};
        }

        return {flag: true, futureIndexes: futureShapeCoordinates};
    }

    rotateShape() {
        const canRotate = this.canRotateShape();
        if (canRotate.flag) {
            this.setGameGridToFree();
            this.currentShape.rotateShape(canRotate.futureIndexes)
            this.updateGameGrid();
        }
    }

    holdShape() {
        if (this.heldShape == null) {
            this.setGameGridToFree();
            this.currentShape.setHasHeld();
            this.heldShape = _.cloneDeep(this.currentShape);
            this.currentShape = this.getNextShape()
            this.nextShape = this.setNextShape();
            this.heldShape.getBlocks().forEach(block => {
                block.drawHeldShape(-300)
            })
            this.updateGameGrid();
        }
        //we are trying to exchange current shape and currently held shape under assumption that current shape has not been held before
        else if (this.heldShape != null && !this.currentShape.getHasHeld()) { 
            this.setGameGridToFree();
            this.currentShape.setHasHeld();
            let currentShapePH = _.cloneDeep(this.currentShape);
            let heldShapePH = _.cloneDeep(this.heldShape);
            this.currentShape = heldShapePH;
            this.heldShape = currentShapePH;
            //when getting the held shape back, reset it to starting position
            this.currentShape.getBlocks().forEach(block => {
                block.resetPosition();
            })
            this.currentShape.setToDefaultRotationPoint();
            this.updateGameGrid();
        }  
    }

    //getters

    getPadding() {
        return this.padding;
    }

    getBlockSize() {
        return this.blockSize;
    }

    getShapegenerator() {
        return this.shapegenerator;
    }

    getGameWidth() {
        return this.gameWidth;
    }

    getGameHeight() {
        return this.gameHeight;
    }

    getLinesCleared() {
        return this.linesCleared;
    }

    getDeadBlocks() {
        return this.deadBlocks
    }

    getHeldShape() {
        return this.heldShape;
    }

    getCurrentShape() {
        return this.currentShape;
    }

    getNextShape() {
        return this.nextShape;
    }

    getGameGrid() {
        return this.gameGrid
    }
}