import { Snake } from './snake.js';
import { Apple } from './apple.js';

export const Game = {
    grid: document.querySelector(".grid"),
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
    apple: null,

    initialize: function () {
        document.addEventListener("keydown", function (e) {
            Snake.control(e, Game.snake, Game.columns);
        });
        this.createBoard();

        this.playAgain.addEventListener("click", this.replay.bind(this));
    },

    addSnake: function (initialPosition, initialDirection) {
        this.snake = Snake.createSnake(initialPosition, initialDirection);
    },

    resetSnakes: function () {
        let initialPosition = this.snake.initialPosition;
        let initialDirection = this.snake.initialDirection;
        this.snake = Snake.createSnake(initialPosition, initialDirection);
    },

    createBoard: function () {
        this.grid.style.width = this.columns * this.snakeUnit;
        this.grid.style.height = this.rows * this.snakeUnit;

        this.playAgain.style.display = "none";
        for (let i = 0; i < this.columns * this.rows; i++) {
            let div = document.createElement("div");
            div.style.width = this.snakeUnit;
            div.style.height = this.snakeUnit;
            this.grid.appendChild(div);
        }
    },

    startGame: function () {
        let squares = document.querySelectorAll(".grid div");
        this.apple = Apple.createApple();
        this.score = 0;
        this.scoreDisplay.innerHTML = this.score;
        this.intervalTime = 250;
        
        // TODO: move snake rendering to a separate function so it happens for all snakes
        this.snake.currentPosition.forEach((index) =>
            squares[index].classList.add("snake")
        );

        this.interval = setInterval(this.updateGame.bind(this), this.intervalTime);
    },

    updateGame: function () {
        let squares = document.querySelectorAll(".grid div");
        if (Snake.checkForHits(this.snake, this.columns, this.rows)) {
            return this.endGame();
        }

        Snake.move(this.snake);

        if (squares[this.snake.currentPosition[0]].classList.contains("apple")) {
            this.eatApple(squares);
        }
    },

    endGame: function () {
        this.playAgain.style.display = "flex";
        this.playAgain.focus();

        return clearInterval(this.interval);
    },

    eatApple: function (squares) {
        let tail = this.snake.currentPosition[this.snake.currentPosition.length - 1];

        squares[this.snake.currentPosition[0]].classList.remove("apple");
        this.snake.growth += this.apple.value;
        this.apple = Apple.createApple();
        this.score++;
        this.scoreDisplay.textContent = this.score;
        clearInterval(this.interval);
        this.intervalTime = this.intervalTime * this.speedIncrease;
        this.interval = setInterval(
            this.updateGame.bind(this),
            this.intervalTime
        );
    },

    replay: function () {
        this.grid.innerHTML = "";
        this.createBoard();
        this.resetSnakes();
        this.startGame();
        this.playAgain.style.display = "none";
    },
};
