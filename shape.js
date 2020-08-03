class Shape {
    constructor(shapeId, blockSize) {
        this.hasHeldShape = false;
        this.type = shapeId.type;
        this.blockSize = blockSize;
        this.color = shapeId.color;
        this.position = shapeId.blockPos;
        this.rotationPoint = shapeId.rotationPoint;
        this.rotationDistX = shapeId.rotationPoint.x;
        this.rotationDistY = shapeId.rotationPoint.y;
        this.blocks = this.setBlocksOfShape();   
        
        this.rotationPoint = this.setRotationPoint();
        this.defaultRotationPoint = this.setRotationPoint();
    }

    getType() {
        return this.type;
    }

    getBlockSize() {
        return this.blockSize;
    }

    getColor() {
        return this.color;
    }

    getPosition() {
        return this.position;
    }

    getRotationPoint() {
        return this.rotationPoint;
    }

    getDefaultRotationPoint() {
        return this.defaultRotationPoint;
    }

    getBlocks() {
        return this.blocks;
    }

    getHasHeld() {
        return this.hasHeldShape;
    }

    setHasHeld() {
        if (this.hasHeldShape === false) {
            this.hasHeldShape = true;
        }
    }

    setToDefaultRotationPoint() {
        this.rotationPoint = this.defaultRotationPoint;
    }

    setBlocksOfShape() {
        var blocks = [];
        for (let pos of this.getPosition()) {
            var spawnX = this.calculateHorizontalSpawnPoint(pos.x);
            blocks.push(new Block(spawnX, pos.y*this.getBlockSize(), this.getBlockSize(), this.getColor()))
        }

        return blocks;
    }

    setRotationPoint() {
        return this.calculateRotationPointRelativeToGameGrid();
    }

    calculateRotationPointRelativeToGameGrid() {
        var rotationCoordinateX = this.rotationDistX * this.blockSize + width/2 - Math.round(this.rotationDistX) * this.blockSize;
        var rotationCoordinateY = this.rotationDistY * this.blockSize;

        return createVector(rotationCoordinateX, rotationCoordinateY);
    }



    moveDown() {
        this.blocks.forEach(block => {
            block.setY(block.getY()+ this.blockSize);
        });
        this.rotationPoint.y += this.blockSize;
    }

    moveLeftRight(direction) {
        switch (direction) {
            case "LEFT":
                this.blocks.forEach(block => {
                    block.x -= this.blockSize;
                })
                this.rotationPoint.x -= this.blockSize;
                break;
            case "RIGHT":
                this.blocks.forEach(block => {
                    block.x += this.blockSize;
                })
                this.rotationPoint.x += this.blockSize;
                break;
        }
    }

    calculateHorizontalSpawnPoint(blockPosX) {
        /*
            calculates the top left coordinate position of a block 
            by taking the block coordinate for the isolated shape and multiplying with the block size
            to get it transfered to the game area scale.
            then add half the width of the game area to get it roughly centered
            then adjust final spawn position based on where the rotational point for the shape is (scaled to block size as well)
        */

        return (blockPosX * this.blockSize) + (width/2) - Math.round(this.rotationDistX) * this.blockSize;
    }

    rotateShape(newCoords) {
        let i = 0;
        
        this.getBlocks().forEach(block => {
            block.setX(newCoords[i].x);
            block.setY(newCoords[i].y);
            i += 1;
        })
    }
}