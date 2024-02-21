const Player = {

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
            previousPosition: [...options.initialPosition],
            previousDirection: options.initialDirection,
            newDirection: null,
            size: options.initialPosition.size,
            currentScore: 0,
            growth: 0,
            canMove: true,
            username: options.username ?? 'Anonymous',
            color: options.color ?? null,
            
            reset: function () {
                this.currentPosition = [...this.initialPosition];
                this.currentDirection = this.initialDirection;
                this.previousPosition = [...this.initialPosition];
                this.previousDirection = this.initialDirection;
                this.newDirection = null;
                this.size = this.initialPosition.size;
                this.growth = 0;
                this.currentScore = 0;
                this.canMove = true;
                this.readyCheck = false;
            },

            score: function (value) {
                this.growth += value;
                this.currentScore += value;
            },

            move: function () {
                if (this.newDirection) {
                    this.previousDirection = this.currentDirection;
                    this.currentDirection = this.newDirection;
                    this.newDirection = null;
                }

                this.previousPosition = [...this.currentPosition];
        
                // Add new head
                this.currentPosition.unshift(this.currentPosition[0] + this.currentDirection);
                
                if (this.growth > 0) {
                    // Grow snake
                    this.growth--;
                } else {
                    // Remove tail
                    this.currentPosition.pop();
                }

                return this.currentPosition[0]; // return the new head index
            },

            checkForHits: function (grid, columns, rows) {
                const direction = this.newDirection || this.currentDirection;

                const hitBottom = this.currentPosition[0] + columns >= columns * rows && direction === columns;
                const hitRight = this.currentPosition[0] % columns === columns - 1 && direction === 1;
                const hitLeft = this.currentPosition[0] % columns === 0 && direction === -1;
                const hitTop = this.currentPosition[0] - columns <= 0 && direction === -columns;
                const hitSnake = grid[this.currentPosition[0] + direction] !== 0;

                if (hitBottom || hitRight || hitLeft || hitTop || hitSnake) {
                    this.canMove = false;

                    return true;
                } else {
                    return false;
                }
            },
        
            changeDirection: function (direction, columns) {
                if (direction === 'right' && this.currentDirection !== -1) {
                    this.newDirection = 1;
                } else if (direction === 'up' && this.currentDirection !== columns) {
                    this.newDirection = -columns;
                } else if (direction === 'left' && this.currentDirection !== 1) {
                    this.newDirection = -1;
                } else if (direction === 'down' && this.currentDirection !== -columns) {
                    this.newDirection = columns;
                }
            },
        };

        return snakeInstance;
    },
};

export default Player;
