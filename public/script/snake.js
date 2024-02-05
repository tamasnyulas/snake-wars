const snake = {
    snakes: [],

    createSnake: function (initialPosition, initialDirection) {
        const newSnake = {
            initialPosition: initialPosition,
            initialDirection: initialDirection,
            currentPosition: [...initialPosition],
            currentDirection: initialDirection,
        };

        this.snakes.push(newSnake);

        return newSnake;
    },

    moveSnake: function (snakeInstance) {
        const squares = document.querySelectorAll(".grid div");
        const tail = snakeInstance.currentPosition.pop();
        squares[tail].classList.remove("snake");
        snakeInstance.currentPosition.unshift(snakeInstance.currentPosition[0] + snakeInstance.currentDirection);
        squares[snakeInstance.currentPosition[0]].classList.add("snake");
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

const game = {
    grid: document.querySelector(".grid"),
    popup: document.querySelector(".popup"),
    playAgain: document.querySelector(".playAgain"),
    scoreDisplay: document.querySelector(".scoreDisplay"),
    appleIndex: 0,
    score: 0,
    speedIncrease: 0.8,
    intervalTime: 0,
    interval: 0,
    columns: 20,
    rows: 20,
    snakeUnit: 20,
    snake: null,

    addSnake: function (initialPosition, initialDirection) {
        this.snake = snake.createSnake(initialPosition, initialDirection);
    },

    resetSnakes: function (c) {
        initialPosition = this.snake.initialPosition;
        initialDirection = this.snake.initialDirection;
        this.snake = snake.createSnake(initialPosition, initialDirection);
    },

    createBoard: function () {
        this.grid.style.width = this.columns * this.snakeUnit;
        this.grid.style.height = this.rows * this.snakeUnit;

        this.popup.style.display = "none";
        for (let i = 0; i < this.columns * this.rows; i++) {
            let div = document.createElement("div");
            div.style.width = this.snakeUnit;
            div.style.height = this.snakeUnit;
            this.grid.appendChild(div);
        }
    },

    startGame: function () {
        let squares = document.querySelectorAll(".grid div");
        this.randomApple(squares);
        this.score = 0;
        this.scoreDisplay.innerHTML = this.score;
        this.intervalTime = 250;
        
        // TODO: move snake rendering to a separate function so it happens for all snakes
        this.snake.currentPosition.forEach((index) =>
            squares[index].classList.add("snake")
        );

        this.interval = setInterval(this.moveOutcome.bind(this), this.intervalTime);
    },

    moveOutcome: function () {
        let squares = document.querySelectorAll(".grid div");
        if (snake.checkForHits(this.snake, this.columns, this.rows)) {
            console.log("you hit something");
            this.popup.style.display = "flex";
            return clearInterval(this.interval);
        } else {
            snake.moveSnake(this.snake);
            this.eatApple(squares); // TODO: consider refactoring into snake object and eating an apple should gradually (step-by-step) grow the snake with a given amount
        }
    },

    eatApple: function (squares) {
        let tail = this.snake.currentPosition[this.snake.currentPosition.length - 1];
        if (squares[this.snake.currentPosition[0]].classList.contains("apple")) {
            squares[this.snake.currentPosition[0]].classList.remove("apple");
            squares[tail].classList.add("snake");
            this.snake.currentPosition.push(tail);
            this.randomApple(squares);
            this.score++;
            this.scoreDisplay.textContent = this.score;
            clearInterval(this.interval);
            this.intervalTime = this.intervalTime * this.speedIncrease;
            this.interval = setInterval(
                this.moveOutcome.bind(this),
                this.intervalTime
            );
        }
    },

    randomApple: function (squares) {
        do {
            this.appleIndex = Math.floor(Math.random() * squares.length);
        } while (squares[this.appleIndex].classList.contains("snake"));
        squares[this.appleIndex].classList.add("apple");
    },

    replay: function () {
        this.grid.innerHTML = "";
        this.createBoard();
        this.resetSnakes();
        this.startGame();
        this.popup.style.display = "none";
    },
};

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("keydown", function (e) {
        snake.control(e, game.snake, game.columns);
    });
    game.addSnake([2, 1, 0], 1);
    game.createBoard();
    game.startGame();
    game.playAgain.addEventListener("click", game.replay.bind(game));
});
