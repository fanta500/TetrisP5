class Block {
    constructor(positionX, positionY, blockSize, color) {
        this.defaultX = positionX;
        this.defaultY = positionY;
        this.x = positionX;
        this.y = positionY;
        this.blockSize = blockSize;
        this.color = color;
    }

    draw() {
        fill(this.color)
        rect(this.x, this.y, this.blockSize, this.blockSize)
    }

    drawNextShape(offset) {
        fill(this.color)
        rect(this.x + offset, this.y + offset/4, this.blockSize, this.blockSize)
    }

    drawHeldShape(offset) {
        fill(this.color)
        rect(this.defaultX + offset, this.defaultY - offset/4, this.blockSize, this.blockSize) //offset param passed here is negative as a precondition, hence minus offset for y coord
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y
    }

    setX(newX) {
        this.x = newX;
    }

    setY(newY) {
        this.y = newY;
    }

    getDefaultX() {
        return defaultX;
    }

    getDefaultY() {
        return defaultY;
    }

    resetPosition() {
        this.x = this.defaultX;
        this.y = this.defaultY;
    }
}