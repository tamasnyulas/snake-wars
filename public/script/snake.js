export const Snake = {
    snakes: [],

    createSnake: function (initialPosition, initialDirection) {
        const newSnake = {
            initialPosition: initialPosition,
            initialDirection: initialDirection,
            currentPosition: [...initialPosition],
            currentDirection: initialDirection,
            size: initialPosition.size,
            growth: 0,
        };

        this.snakes.push(newSnake);

        return newSnake;
    },

    move: function (snakeInstance) {
        const squares = document.querySelectorAll(".grid div");
        const tail = snakeInstance.currentPosition.pop();
        squares[tail].classList.remove("snake");
        snakeInstance.currentPosition.unshift(snakeInstance.currentPosition[0] + snakeInstance.currentDirection);
        squares[snakeInstance.currentPosition[0]].classList.add("snake");
        
        if (snakeInstance.growth > 0) {
            snakeInstance.currentPosition.push(tail);
            squares[tail].classList.add("snake");
            snakeInstance.growth--;
        }
    },

    checkForHits: function (snakeInstance, columns, rows) {
        const squares = document.querySelectorAll(".grid div");
        const hitBottom = snakeInstance.currentPosition[0] + columns >= columns * rows && snakeInstance.currentDirection === columns;
        const hitRight = snakeInstance.currentPosition[0] % columns === columns - 1 && snakeInstance.currentDirection === 1;
        const hitLeft = snakeInstance.currentPosition[0] % columns === 0 && snakeInstance.currentDirection === -1;
        const hitTop = snakeInstance.currentPosition[0] - columns <= 0 && snakeInstance.currentDirection === -columns;
        const hitSelf = squares[snakeInstance.currentPosition[0] + snakeInstance.currentDirection]?.classList.contains("snake");

        if (hitBottom || hitRight || hitLeft || hitTop || hitSelf) {
            return true;
        } else {
            return false;
        }
    },

    control: function (e, snakeInstance, columns) {
        if (e.keyCode === 39 && snakeInstance.currentDirection !== -1) {
            snakeInstance.currentDirection = 1; // right 
        } else if (e.keyCode === 38 && snakeInstance.currentDirection !== columns) {
            snakeInstance.currentDirection = -columns; // up
        } else if (e.keyCode === 37 && snakeInstance.currentDirection !== 1) {
            snakeInstance.currentDirection = -1; // left
        } else if (e.keyCode === 40 && snakeInstance.currentDirection !== -columns) {
            snakeInstance.currentDirection = columns; // down
        }
    },
};
