import { Snake } from './snake.js';
import { Apple } from './apple.js';

export const Game = {
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
        this.snake = Snake.createSnake(initialPosition, initialDirection);
    },

    resetSnakes: function (c) {
        initialPosition = this.snake.initialPosition;
        initialDirection = this.snake.initialDirection;
        this.snake = Snake.createSnake(initialPosition, initialDirection);
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
        if (Snake.checkForHits(this.snake, this.columns, this.rows)) {
            console.log("you hit something");
            this.popup.style.display = "flex";
            return clearInterval(this.interval);
        } else {
            Snake.move(this.snake);
            this.eatApple(squares);
        }
    },

    eatApple: function (squares) {
        let tail = this.snake.currentPosition[this.snake.currentPosition.length - 1];
        if (squares[this.snake.currentPosition[0]].classList.contains("apple")) {
            squares[this.snake.currentPosition[0]].classList.remove("apple");

            this.snake.growth += 5;

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
