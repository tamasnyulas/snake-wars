export const Snake = {

    createSnake: function (options = {}) {
        const defaultOptions = {
            id: null,
            initialPosition: [2, 1, 0], // TODO: remove hardocded position and calculate it based on active players when the game starts
            initialDirection: 1,
            readyCheck: false,
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

    checkForHits: function (snakeInstance, grid, columns, rows) {
        if (!snakeInstance.canMove) return false;

        const hitBottom = snakeInstance.currentPosition[0] + columns >= columns * rows && snakeInstance.currentDirection === columns;
        const hitRight = snakeInstance.currentPosition[0] % columns === columns - 1 && snakeInstance.currentDirection === 1;
        const hitLeft = snakeInstance.currentPosition[0] % columns === 0 && snakeInstance.currentDirection === -1;
        const hitTop = snakeInstance.currentPosition[0] - columns <= 0 && snakeInstance.currentDirection === -columns;
        const hitSnake = grid[snakeInstance.currentPosition[0] + snakeInstance.currentDirection] !== null;

        if (hitBottom || hitRight || hitLeft || hitTop || hitSnake) {
            return true;
        } else {
            return false;
        }
    },

    move: function (snakeInstance) {
        if (!snakeInstance.canMove) return;

        // Add new head
        snakeInstance.currentPosition.unshift(snakeInstance.currentPosition[0] + snakeInstance.currentDirection);
        
        if (snakeInstance.growth > 0) {
            // Grow snake
            snakeInstance.growth--;
        } else {
            // Remove tail
            snakeInstance.currentPosition.pop();
        }
    },

    changeDirection: function (snakeInstance, direction, columns) {
        if (direction === 'right' && snakeInstance.currentDirection !== -1) {
            snakeInstance.currentDirection = 1;
        } else if (direction === 'up' && snakeInstance.currentDirection !== columns) {
            snakeInstance.currentDirection = -columns;
        } else if (direction === 'left' && snakeInstance.currentDirection !== 1) {
            snakeInstance.currentDirection = -1;
        } else if (direction === 'down' && snakeInstance.currentDirection !== -columns) {
            snakeInstance.currentDirection = columns;
        }
        console.log('change direction:', snakeInstance.id, snakeInstance.currentDirection);
    },
};
