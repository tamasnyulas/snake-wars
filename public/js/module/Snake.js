export const Snake = {
    directionMap: {},
    controlKeys: {
        left: 'ArrowLeft',
        up: 'ArrowUp',
        right: 'ArrowRight',
        down: 'ArrowDown',
    },

    initialize: function (columns) {
        this.directionMap = {
            "1": "east",
            '-1': "west",
            [columns]: "south",
            ["-" + columns]: "north",
        };
    },

    createSnake: function (options) {
        
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

    render: function (snakeState, grid) {
        if (!snakeState.canMove) return;

        if (snakeState.previousPosition) {
            snakeState.previousPosition.forEach(index => {
                grid[index].classList.remove("head", "body", "tail", "snake");
            });
        }

        snakeState.currentPosition.forEach((index, i) => {
            let snakePart = i === 0 ? "head" : i === snakeState.currentPosition.length - 1 ? "tail" : "body";
            
            grid[index].classList.add("snake", snakePart);
            grid[index].classList.remove("apple");
            grid[index].style.backgroundColor = snakeState.color;

            if (i === 0) {
                // Set direction for snake head
                grid[index].dataset.direction = this.directionMap[snakeState.currentDirection];
            } else if (i === snakeState.currentPosition.length - 1) {
                // Clean up direction for previous snake tail
                const previousTailIndex = snakeState.previousPosition[snakeState.previousPosition.length - 1];
                delete grid[previousTailIndex].dataset.direction;

                // Set direction for snake tail
                const lastBodyIndex = snakeState.currentPosition[snakeState.currentPosition.length - 2];
                grid[index].dataset.direction = grid[lastBodyIndex].dataset.direction;
            }
        });
    },

    control: function (e, snakeInstance, columns, socket) {
        if (!snakeInstance.canMove) return;

        if (e.key === this.controlKeys.right && snakeInstance.currentDirection !== -1) {
            snakeInstance.currentDirection = 1;
            socket.emit('snake-control', {direction: 'right'});
        } else if (e.key === this.controlKeys.up && snakeInstance.currentDirection !== columns) {
            snakeInstance.currentDirection = -columns;
            socket.emit('snake-control', {direction: 'up'})
        } else if (e.key === this.controlKeys.left && snakeInstance.currentDirection !== 1) {
            snakeInstance.currentDirection = -1;
            socket.emit('snake-control', {direction: 'left'});
        } else if (e.key === this.controlKeys.down && snakeInstance.currentDirection !== -columns) {
            snakeInstance.currentDirection = columns;
            socket.emit('snake-control', {direction: 'down'});
        }
    },
};
