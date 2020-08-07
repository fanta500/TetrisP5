class Shapegenerator {
    constructor(blockSize) {
        this.blockSize = blockSize;
        this.setShapes();
        this.shapes = [this.squareShape, this.lineShape, this.tShape, this.lShape, this.jShape, this.sShape, this.zShape];
    }

    setShapes() {
        this.squareShape = {
            blockPos: [createVector(0,0), createVector(1,0), createVector(0,1), createVector(1,1)],
            rotationPoint: createVector(1,1),
            color: color(255,255,0),
            type: "SQ"
        }
        this.lineShape = {
            blockPos: [createVector(0,0), createVector(1,0), createVector(2,0), createVector(3,0)],
            rotationPoint: createVector(2,1),
            color: color(0,200,255),
            type: "LINE"
        }
        this.tShape = {
            blockPos: [createVector(0,0), createVector(1,0), createVector(2,0), createVector(1,1)],
            rotationPoint: createVector(1.5,0.5),
            color: color(255,0,255),
            type: "T"
        }
        this.lShape = {
            blockPos: [createVector(0,1), createVector(1,1), createVector(2,1), createVector(2,0)],
            rotationPoint: createVector(1.5,1.5),
            color: color(255,125,0),
            type: "L"
        }
        this.jShape = {
            blockPos: [createVector(0,0), createVector(0,1), createVector(1,1), createVector(2,1)],
            rotationPoint: createVector(1.5,1.5),
            color: color(0,0,255),
            type: "J"
        }
        this.sShape = {
            blockPos: [createVector(0,1), createVector(1,1), createVector(1,0), createVector(2,0)],
            rotationPoint: createVector(1.5,1.5),
            color: color(0,255,0),
            type: "S"
        }
        this.zShape = {
            blockPos: [createVector(0,0), createVector(1,0), createVector(1,1), createVector(2,1)],
            rotationPoint: createVector(1.5,1.5),
            color: color(255,0,0),
            type: "Z"
        }
    }

    generateShape() {
        var shapeId = Math.floor(Math.random() * this.shapes.length);
        var shape = new Shape(this.shapes[shapeId], this.blockSize);
        return shape;
    }
}