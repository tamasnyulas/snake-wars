import { Snake } from './snake.js';
import { Apple } from './apple.js';

export const Game = {
    board: document.querySelector(".board"),
    grid: null,
    playAgain: document.querySelector(".playAgain"),
    scoreDisplay: document.querySelector(".scoreDisplay"),
    settingsForm: document.querySelector(".settingsForm"),
    intervalTime: 0,
    interval: 0,
    minInterval: 50,
    snakeUnit: 20,
    activePlayers: 1,
    settings: {
        speedIncrement: 0.8,
        columns: 20,
        rows: 20,
        players: 1,
        endEarly: true,
    },
    players: [
        { // player 1
            initialPosition: [17, 18, 19], // TODO: calculate initial position based on rows and columns
            initialDirection: -1,
            color: 'orange',
        },
        { // player 2
            initialPosition: [2, 1, 0],
            initialDirection: 1,
            controlKeys: { 
                left: 'a', 
                up: 'w', 
                right: 'd', 
                down: 's',
            },
            color: 'cornflowerblue',
        },
        { // player 3
            initialPosition: [(19*20)+2, (19*20)+1, (19*20)+0], // TODO: calculate initial position based on rows and columns
            initialDirection: 1,
            controlKeys: { 
                left: '4', 
            up: '8', 
            right: '6', 
            down: '5',
            },
            color: 'tan',
        },
    ],
    snakes: [],
    apple: null,

    initialize: function () {
        Snake.initialize(this.snakes, this.settings.columns);
        this.createSnakes();
        this.createBoard();

        document.addEventListener("keydown", function (e) {
            Snake.control(e, Game.snakes, Game.settings.columns);
        });

        this.playAgain.addEventListener("click", this.replay.bind(this));
        this.settingsForm.addEventListener("submit", this.updateSettings.bind(this));
    },

    createSnakes: function () {
        this.snakes = [];

        for (let i = 0; i< this.settings.players; i++) {
            this.snakes.push(Snake.createSnake(this.players[i]));
        }
    },

    createBoard: function () {
        this.board.style.width = this.settings.columns * this.snakeUnit;
        this.board.style.height = this.settings.rows * this.snakeUnit;

        this.playAgain.style.display = "none";
        for (let i = 0; i < this.settings.columns * this.settings.rows; i++) {
            let div = document.createElement("div");
            div.classList.add("grid");
            div.style.width = this.snakeUnit;
            div.style.height = this.snakeUnit;
            this.board.appendChild(div);
        }
        this.grid = document.querySelectorAll(".grid");
    },

    updateSettings: function () {
        this.settings.speedIncrement = parseFloat(this.settingsForm.speedIncrement.value);
        this.settings.columns = parseInt(this.settingsForm.columns.value);
        this.settings.rows = parseInt(this.settingsForm.rows.value);
        this.settings.players = parseInt(this.settingsForm.players.value);
        this.settings.endEarly = this.settingsForm.endEarly.checked;

        this.createSnakes();
        Snake.initialize(this.snakes, this.settings.columns);
        this.replay();
    },

    startGame: function () {
        this.apple = Apple.createApple(this.grid);
        this.intervalTime = 200;
        this.activePlayers = this.snakes.length;
        
        this.snakes.forEach(snake => Snake.render(snake, this.grid));
        this.refreshScore();

        this.interval = setInterval(this.updateGame.bind(this), this.intervalTime); // TODO: consider changing intervals to exist per snake
    },

    updateGame: function () {
        this.snakes.forEach(snake => {
            if (Snake.checkForHits(snake, this.grid, this.settings.columns, this.settings.rows)) { // TODO: consider moving checkForHits to Snake.move and make Snake.move object-oriented
                snake.canMove = false; 

                // check end game condition
                if (this.settings.endEarly || --this.activePlayers < 1) {
                    this.endGame();
                    return;    
                }
            }

            Snake.move(snake, this.grid);

            if (this.grid[snake.currentPosition[0]].classList.contains("apple")) {
                this.eatApple(snake);
            }
        });
    },

    endGame: function () {
        clearInterval(this.interval);

        this.refreshScore(true);

        this.playAgain.style.display = "flex";
        this.playAgain.focus();
    },

    eatApple: function (snake) {
        this.grid[snake.currentPosition[0]].classList.remove("apple");
        snake.score(this.apple.value);
        this.refreshScore();

        if (this.apple.speedBomb) {
            this.increaseSpeed();
        }

        this.apple = Apple.createApple(this.grid);
    },

    refreshScore: function (endGame = false) {
        let topScore = this.determineTopScore();
        this.scoreDisplay.innerHTML = "";

        this.snakes.forEach((snake, index) => {
            const row = document.createElement("tr");
            row.style.color = snake.color;

            if (endGame && snake.currentScore > 0 && snake.currentScore === topScore) {
                row.classList.add("winner");
            }

            row.innerHTML = `<th>Snake ${index + 1}</th><td>${snake.currentScore}</td>`;
            this.scoreDisplay.appendChild(row);
        });
    },

    determineTopScore: function () {
        let scores = this.snakes.map(snake => snake.currentScore);
        let topScore = Math.max(...scores);
        
        return topScore
    },

    increaseSpeed: function () {
        let newIntervalTime = this.intervalTime * this.settings.speedIncrement;

        if (newIntervalTime <= this.minInterval) return;

        clearInterval(this.interval);
        this.intervalTime = newIntervalTime;
        this.interval = setInterval(this.updateGame.bind(this), this.intervalTime);
    },

    replay: function () {
        this.board.innerHTML = "";
        this.endGame();
        this.resetSnakes();
        this.createBoard();
        this.startGame();
        this.playAgain.style.display = "none";
    },

    resetSnakes: function () {
        this.snakes.forEach(snake => snake.reset());
    },
};