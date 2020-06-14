'use strict';
class Python{
    constructor(x, y, direction){
        this.x = undefined;
        this.y = undefined;
        this.head = new Section(x, y, 'https://i.ya-webdesign.com/images/transparent-circle-png-2.png', direction);
        this.sections = [];
        this.direction = direction;
    }

    createHead(){
        this.sections.push(this.head);
    }

    addSection(){
        let newSectionSetting = {};
        let lastSection = this.sections[this.sections.length-1];
        switch (lastSection.direction){
            case 0:
                newSectionSetting.x = lastSection.x + 1;
                newSectionSetting.y = lastSection.y;
                break;
            case 1:
                newSectionSetting.x = lastSection.x;
                newSectionSetting.y = lastSection.y + 1;
                break;
            case 2:
                newSectionSetting.x = lastSection.x - 1;
                newSectionSetting.y = lastSection.y;
                break;
            case 3:
                newSectionSetting.x = lastSection.x;
                newSectionSetting.y = lastSection.y - 1;
                break;
        }
        newSectionSetting.direction = lastSection.direction;
        let section = new Section(newSectionSetting.x, newSectionSetting.y, 'https://i.ya-webdesign.com/images/glow-circle-png-15.png', newSectionSetting.direction);
        section.delayedDirections = [...lastSection.delayedDirections]
        this.sections.push(section);
    }

    setDirection(newDirection){
        if(Math.abs(this.direction - newDirection) === 2 || this.direction === newDirection)return;
        this.direction = newDirection;
        this.sections.forEach(section => section.setDirection(this.direction, this.head.x, this.head.y));
    }

    move() {
        this.sections.forEach(section => section.move());
        this.x = this.head.x;
        this.y = this.head.y;
    }
}