'use strict';
class Section{
    constructor(x, y, imageSrc, direction){
        this.x = x;
        this.y = y;

        this.imageSrc = imageSrc;
        this.direction = direction;

        this.delayedDirections = [];
    }

    setDirection = (newDirection, headX = this.x, headY = this.y) => {
        let deltaX = Math.abs(headX - this.x);
        let deltaY = Math.abs(headY - this.y);
        if(deltaX === 0 && deltaY === 0) this.direction = newDirection;
        else {
            this.delayedDirections.push({newDirection, x: headX, y: headY});
        }
    }

    move() {
        switch (this.direction) {
            case 0:
                this.x--;
                break;
            case 1:
                this.y--;
                break;
            case 2:
                this.x++;
                break;
            case 3:
                this.y++;
                break;
        }
        if(this.delayedDirections[0] !== undefined){
            this.checkDirectionChanging();
        }
    }

    checkDirectionChanging(){
        if(this.x === this.delayedDirections[0].x && this.y === this.delayedDirections[0].y){
            this.setDirection(this.delayedDirections[0].newDirection);
            this.delayedDirections.shift();
        } else return;
    }
}