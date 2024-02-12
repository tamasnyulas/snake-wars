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
            previousPosition: [...options.initialPosition],
            previousDirection: options.initialDirection,
            size: options.initialPosition.size,
            currentScore: 0,
            growth: 0,
            canMove: true,
            
            reset: function () {
                this.currentPosition = [...this.initialPosition];
                this.currentDirection = this.initialDirection;
                this.previousPosition = [...this.initialPosition];
                this.previousDirection = this.initialDirection;
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
            },

            checkForHits: function (grid, columns, rows) {
                const hitBottom = this.currentPosition[0] + columns >= columns * rows && this.currentDirection === columns;
                const hitRight = this.currentPosition[0] % columns === columns - 1 && this.currentDirection === 1;
                const hitLeft = this.currentPosition[0] % columns === 0 && this.currentDirection === -1;
                const hitTop = this.currentPosition[0] - columns <= 0 && this.currentDirection === -columns;
                const hitSnake = grid[this.currentPosition[0] + this.currentDirection] !== null;

                if (hitBottom || hitRight || hitLeft || hitTop || hitSnake) {
                    this.canMove = false;

                    return true;
                } else {
                    return false;
                }
            },
        
            changeDirection: function (direction, columns) {
                this.previousDirection = this.currentDirection;

                if (direction === 'right' && this.currentDirection !== -1) {
                    this.currentDirection = 1;
                } else if (direction === 'up' && this.currentDirection !== columns) {
                    this.currentDirection = -columns;
                } else if (direction === 'left' && this.currentDirection !== 1) {
                    this.currentDirection = -1;
                } else if (direction === 'down' && this.currentDirection !== -columns) {
                    this.currentDirection = columns;
                }
                //console.log('change direction:', this.id, this.currentDirection);
            },
        };

        return snakeInstance;
    },
};
