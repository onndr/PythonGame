'use strict';
class GamingArea {
    constructor(parentNode, rowsCount, collumnsCount, scoreSection = null) {
        this.cells = [];
        this.rowsCount = rowsCount;
        this.collumnsCount = collumnsCount;
        this.totalCellsCount = rowsCount * collumnsCount;
        this.parent = parentNode;
        this.tableNode = undefined;
        this.items = [];
        this.obstacles = [];
        this.foods = [];
        this.python = undefined;
        this.score = 0;
        this.scoreSection = scoreSection;

        this.isGameContinues = false;
    }

    startGame(x, y, direction, movingSpeed, foodGenerationSpeed, maxObstaclesCount) {
        this.isGameContinues = true;
        this.parent.removeAttribute('hidden');
        this.createTable();
        this.updateScore();
        this.createPython(x, y, direction);
        setTimeout(() => { this.generateFood(foodGenerationSpeed) }, foodGenerationSpeed);
        setTimeout(() => { this.generateObstacle(Math.ceil(Math.random() * 11000), maxObstaclesCount) }, Math.ceil(Math.random() * 11000));
        this.movePython(movingSpeed);
        this.scoreSection.parentNode.removeAttribute('hidden');
        this.scoreSection.parentNode.style.display = 'flex';
        document.addEventListener('keydown', this.changePythonDirection);
        document.addEventListener('touchstart', this.handleTouchStart, false);
        document.addEventListener('touchend', this.handleTouchEnd, false);
        document.addEventListener('touchmove', () => { event.preventDefault() });
        console.log('Game started');
    }

    handleTouchStart = (event) => {
        this.startPoint = { x: event.changedTouches[0].screenX, y: event.changedTouches[0].screenY };
    }

    handleTouchEnd = (event) => {
        this.endPoint = { x: event.changedTouches[0].screenX, y: event.changedTouches[0].screenY };
        let dX = this.endPoint.x - this.startPoint.x;
        let dY = this.endPoint.y - this.startPoint.y;
        if (Math.abs(dX) > Math.abs(dY)) {
            if (dX > 0) {
                this.changePythonDirection({ keyCode: KEY_D });
            } else if (dX < 0) {
                this.changePythonDirection({ keyCode: KEY_A });
            }
        } else if (Math.abs(dY) > Math.abs(dX)) {
            if (dY > 0) {
                this.changePythonDirection({ keyCode: KEY_S });
            } else if (dY < 0) {
                this.changePythonDirection({ keyCode: KEY_W });
            }
        }
    }

    endGame() {
        this.isGameContinues = false;
        document.removeEventListener('keydown', this.changePythonDirection);
        document.removeEventListener('touchstart', this.touchStart);
        document.removeEventListener('touchend', this.touchEnd);
        console.log('Game over');
        alert('Game over');
        this.tableNode.remove();
        this.scoreSection.parentNode.setAttribute('hidden', 'hidden');
        this.scoreSection.parentNode.style.display = 'none';
        document.querySelectorAll('.toHide').forEach(item => item.removeAttribute('hidden'));
    }

    updateScore() {
        if (!this.scoreSection) return;
        this.scoreSection.innerText = this.score;
    }

    generateFood = (speed) => {
        if (!this.checkIfGameCanContinue()) return;
        let food = document.createElement('img');
        food.src = 'images/food.png';

        const defineFoodPosition = (existingFoods) => {
            let foodPosition = {
                x: Math.round(Math.random() * (this.collumnsCount - 1)),
                y: Math.round(Math.random() * (this.rowsCount - 1))
            };

            let isPositionOccupied = existingFoods.some(element => element.x === foodPosition.x && element.y === foodPosition.y);

            if (isPositionOccupied) {
                return defineFoodPosition(existingFoods);
            } else return foodPosition;
        }

        let position = defineFoodPosition(this.items);

        this.foods.push(position);
        this.items.push(position);
        this.renderFood(food);

        if (this.items.length === this.totalCellsCount) return;

        setTimeout(() => { this.generateFood(speed) }, speed);
    }

    generateObstacle = (speed, maxObstaclesCount) => {
        if (!this.checkIfGameCanContinue()) return;
        let obstacle = document.createElement('img');
        obstacle.src = `images/obst${Math.round(Math.random() * 3)}.png`;

        const defineObstaclePosition = (existingItems) => {
            let obstaclePosition = {
                x: Math.round(Math.random() * (this.collumnsCount - 1)),
                y: Math.round(Math.random() * (this.rowsCount - 1))
            };

            let isPositionOccupied = existingItems.some(element => element.x === obstaclePosition.x && element.y === obstaclePosition.y);
            //let isPositionOccupied = existingFoods.some(element => element.x === obstaclePosition.x && element.y === obstaclePosition.y);

            if (isPositionOccupied) {
                return defineObstaclePosition(existingItems);
            } else return obstaclePosition;
        }

        let position = defineObstaclePosition(this.items);

        this.obstacles.push(position);
        this.items.push(position);
        this.renderObstacle(obstacle, maxObstaclesCount);

        if (this.items.length === this.totalCellsCount) return;

        setTimeout(() => { this.generateObstacle(Math.ceil(Math.random() * 11000) + 10000, maxObstaclesCount) }, speed);
    }

    renderFood(foodElement) {
        if (!this.checkIfGameCanContinue()) return;
        let newFoods = this.foods.filter(element => this.cells[element.y][element.x].childNodes.length === 0);
        newFoods.forEach(element => {
            this.cells[element.y][element.x].append(foodElement);
            //this.cells[element.y][element.x].className = 'apple';
        });
        this.foods.forEach(el => {this.cells[el.y][el.x].className = 'apple'});
    }

    renderObstacle(obstacleElement, maxObstaclesCount) {
        if (!this.checkIfGameCanContinue()) return;
        let newObstacles = this.obstacles.filter(element => this.cells[element.y][element.x].childNodes.length === 0);
        newObstacles.forEach(element => {
            this.cells[element.y][element.x].append(obstacleElement);
            this.cells[element.y][element.x].className = 'obstacle';
        });
        if (!(this.obstacles.length % (maxObstaclesCount + 1))) {
            let pos = { ...this.obstacles[0] };
            this.cells[pos.y][pos.x].className = '';
            this.cells[pos.y][pos.x].firstChild.remove();
            this.obstacles.shift();
        }
    }

    renderPython(isShown) {
        if (!this.checkIfGameCanContinue()) return;
        if (isShown) {
            this.checkIfSmashed();

            this.eatFood();

            this.showPython();
        } else {
            this.hidePython();
        }
    }

    movePython = (speed) => {
        if (!this.checkIfGameCanContinue()) return;
        this.renderPython(false);
        this.python.move();
        this.renderPython(true);

        setTimeout(() => { this.movePython(speed) }, speed);
    }

    changePythonDirection = (event) => {
        if (!this.checkIfGameCanContinue()) return;
        let key = event.keyCode;

        if ((key < KEY_LEFT_ARROW && key > KEY_DOWN_ARROW) && key !== KEY_A && key !== KEY_W && key != KEY_D && key !== KEY_S) return;

        switch (key) {
            case (KEY_LEFT_ARROW):
                this.python.setDirection(0);
                break;
            case (KEY_UP_ARROW):
                this.python.setDirection(1);
                break;
            case (KEY_RIGHT_ARROW):
                this.python.setDirection(2);
                break;
            case (KEY_DOWN_ARROW):
                this.python.setDirection(3);
                break;
            case (KEY_A):
                this.python.setDirection(0);
                break;
            case (KEY_W):
                this.python.setDirection(1);
                break;
            case (KEY_D):
                this.python.setDirection(2);
                break;
            case (KEY_S):
                this.python.setDirection(3);
                break;
        }
    }

    createPython(x, y, direction) {
        this.python = new Python(x, y, direction);
        this.python.createHead();
        let headSection = this.python.head;
        let sectionImage = document.createElement('img');
        sectionImage.src = headSection.imageSrc;
        this.cells[headSection.y][headSection.x].append(sectionImage);
    }

    createTable() {
        let table = document.createElement('table');
        for (let i = 0; i < this.rowsCount; i++) {
            let row = document.createElement('tr');
            this.cells[i] = [];
            for (let j = 0; j < this.collumnsCount; j++) {
                let cell = document.createElement('td');
                this.cells[i][j] = cell;
                row.append(cell);
            }
            table.append(row);
        }
        table.className = 'pythonField';
        table.border = '2';

        this.tableNode = table;
        this.parent.append(table);
    }

    eatFood = () => {
        if (!this.checkIfGameCanContinue()) return;
        let pythonHead = { x: this.python.x, y: this.python.y };
        if (this.cells[pythonHead.y][pythonHead.x].firstChild) {
            if (this.cells[pythonHead.y][pythonHead.x].firstChild.tagName === 'IMG') {
                this.cells[pythonHead.y][pythonHead.x].firstChild.remove();
                let food = this.foods.filter(el => el.x === pythonHead.x && el.y === pythonHead.y)[0];
                if (food) {
                    this.foods.splice(this.foods.indexOf(food), 1);
                    this.cells[pythonHead.y][pythonHead.x].className = '';
                    this.python.addSection();
                    this.score++;
                    this.updateScore();
                }
                let obstacle = this.obstacles.filter(el => el.x === pythonHead.x && el.y === pythonHead.y)[0];
                if (obstacle) {
                    this.endGame();
                }
            }
        }
    }

    checkIfSmashed() {
        if (!this.checkIfGameCanContinue()) return;
        if (this.python.x === this.collumnsCount || this.python.y === this.rowsCount ||
            this.python.x === -1 || this.python.y === -1) {
            this.python = null;
            this.endGame();
            return
        }
        if (this.python.sections.some(
            (section, index) => {
                if (section.x === this.python.x && section.y === this.python.y && index !== 0) return true;
            })
        ) {
            this.python = null;
            this.endGame();
            return;
        }

    }

    showPython() {
        if (!this.checkIfGameCanContinue()) return;
        this.python.sections.forEach((section, index) => {
            if (!this.cells[section.y] || !this.cells[section.y][section.x]) {
                this.python.sections.splice(index, 1);
                return;
            };
            let sectionImage = document.createElement('img');
            sectionImage.src = section.imageSrc;
            this.cells[section.y][section.x].append(sectionImage);
            this.cells[section.y][section.x].className = 'occupiedCell';
        })
    }

    hidePython() {
        if (!this.checkIfGameCanContinue()) return;
        this.python.sections.forEach((section, index) => {
            if ((!this.cells[section.y] || !this.cells[section.y][section.x] || !this.cells[section.y][section.x].lastChild) && index !== 0) {
                return;
            }
            this.cells[section.y][section.x].removeChild(this.cells[section.y][section.x].lastChild);
            this.cells[section.y][section.x].className = '';
        })
    }

    checkIfGameCanContinue() {
        if (!this.isGameContinues) return false;
        if (!this.python) return false;
        return true;
    }
}