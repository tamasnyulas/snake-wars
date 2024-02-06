export const Snake = {
    directionMap: {},

    initialize: function (snakes, columns) {
        this.directionMap = {
            "1": "east",
            '-1': "west",
            [columns]: "south",
            ["-" + columns]: "north",
        };
        
        //document.addEventListener("keydown", function (e) {
        //    Snake.control(e, snakes, columns);
        //});
    },

    createSnake: function (options) {
        const defaultOptions = {
            initialPosition: [2, 1, 0],
            initialDirection: 1,
            controlKeys: {
                left: 'ArrowLeft',
                up: 'ArrowUp',
                right: 'ArrowRight',
                down: 'ArrowDown',
            },
            color: 'lightgray',
        };

        const snakeInstance = {
            ...defaultOptions,
            ...options,
            currentPosition: [...options.initialPosition],
            currentDirection: options.initialDirection,
            size: options.initialPosition.size,
            currentScore: 0,
            growth: 0,
            canMove: true,
            reset: function () {
                this.currentPosition = [...this.initialPosition];
                this.currentDirection = this.initialDirection;
                this.size = this.initialPosition.size;
                this.growth = 0;
                this.currentScore = 0;
                this.canMove = true;
            },
            score: function (value) {
                this.growth += value;
                this.currentScore += value;
            },
        };

        return snakeInstance;
    },

    render: function (snakeInstance, grid) {
        snakeInstance.currentPosition.forEach((index, i) => {
            let snakePart = i === 0 ? "head" : i === snakeInstance.currentPosition.length - 1 ? "tail" : "body";
            grid[index].classList.add("snake", snakePart);
            grid[index].style.backgroundColor = snakeInstance.color;
            grid[index].dataset.direction = this.directionMap[snakeInstance.currentDirection];
        });
    },

    move: function (snakeInstance, grid) {
        if (!snakeInstance.canMove) return;

        let tail = snakeInstance.currentPosition[snakeInstance.currentPosition.length - 1];

        // Add new head
        snakeInstance.currentPosition.unshift(snakeInstance.currentPosition[0] + snakeInstance.currentDirection);
        grid[snakeInstance.currentPosition[0]].classList.add("snake", "head");
        grid[snakeInstance.currentPosition[0]].style.backgroundColor = snakeInstance.color;
        grid[snakeInstance.currentPosition[0]].dataset.direction = this.directionMap[snakeInstance.currentDirection];
        grid[snakeInstance.currentPosition[1]].classList.replace("head", "body");
        
        if (snakeInstance.growth > 0) {
            // Grow snake
            grid[tail].classList.replace("body", "tail");
            snakeInstance.growth--;
        } else {
            // Remove tail
            snakeInstance.currentPosition.pop();
            grid[tail].classList.remove("snake", "head", "body", "tail");
            grid[tail].style.backgroundColor = '';
            delete grid[tail].dataset.direction;

            // define new tail
            grid[snakeInstance.currentPosition[snakeInstance.currentPosition.length - 1]].classList.replace("body", "tail");
            grid[snakeInstance.currentPosition[snakeInstance.currentPosition.length - 1]].dataset.direction = grid[snakeInstance.currentPosition[snakeInstance.currentPosition.length - 2]].dataset.direction;
        }
    },

    checkForHits: function (snakeInstance, grid, columns, rows) {
        if (!snakeInstance.canMove) return false;

        const hitBottom = snakeInstance.currentPosition[0] + columns >= columns * rows && snakeInstance.currentDirection === columns;
        const hitRight = snakeInstance.currentPosition[0] % columns === columns - 1 && snakeInstance.currentDirection === 1;
        const hitLeft = snakeInstance.currentPosition[0] % columns === 0 && snakeInstance.currentDirection === -1;
        const hitTop = snakeInstance.currentPosition[0] - columns <= 0 && snakeInstance.currentDirection === -columns;
        const hitSelf = grid[snakeInstance.currentPosition[0] + snakeInstance.currentDirection]?.classList.contains("snake");

        if (hitBottom || hitRight || hitLeft || hitTop || hitSelf) {
            return true;
        } else {
            return false;
        }
    },

    control: function (e, snakes, columns) {
        snakes.forEach(snakeInstance => {
            if (e.key === snakeInstance.controlKeys.right && snakeInstance.currentDirection !== -1) {
                snakeInstance.currentDirection = 1;
            } else if (e.key === snakeInstance.controlKeys.up && snakeInstance.currentDirection !== columns) {
                snakeInstance.currentDirection = -columns;
            } else if (e.key === snakeInstance.controlKeys.left && snakeInstance.currentDirection !== 1) {
                snakeInstance.currentDirection = -1;
            } else if (e.key === snakeInstance.controlKeys.down && snakeInstance.currentDirection !== -columns) {
                snakeInstance.currentDirection = columns;
            }
        })
    },
};
